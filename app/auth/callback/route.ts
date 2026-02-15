import { getUserProfile } from '@/lib/api/database'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@/types'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Get redirect path based on user role
 */
function getRedirectPath(role: UserRole): string {
  switch (role) {
    case 'consumer':
      return '/'
    case 'producer':
      return '/seller/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/'
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    // Redirect to auth page with error
    return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(errorDescription || error)}`, request.url))
  }

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent('Supabase not configured')}`, request.url))
      }

      // Create response first to ensure cookies can be set in it
      const response = NextResponse.next()

      // Create server client with proper cookie handling that writes to the response
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set cookies in both the cookie store and the response
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      })

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Failed to exchange code for session:', exchangeError)
        return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, request.url))
      }

      // If user is authenticated, fetch role and redirect accordingly
      const user = data?.session?.user || (data as { user?: { id: string } })?.user
      if (user) {
        const profile = await getUserProfile(user.id)
        if (profile) {
          const redirectPath = next || getRedirectPath(profile.role)
          // Redirect with the response that has cookies set
          return NextResponse.redirect(new URL(redirectPath, request.url), {
            headers: response.headers,
          })
        }
      }
    } catch (error) {
      console.error('Supabase auth callback failed:', error)
      return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent('Authentication failed')}`, request.url))
    }
  }

  // Fallback redirect
  const redirectPath = next || '/'
  return NextResponse.redirect(new URL(redirectPath, request.url))
}
