import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

      // Create redirect URL first
      const redirectPath = next || '/'
      const redirectUrl = new URL(redirectPath, request.url)
      
      // Create response object first so we can set cookies on it
      const response = NextResponse.redirect(redirectUrl)

      // Create server client with proper cookie handling that writes directly to response
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set cookies in both cookie store and response
              cookieStore.set(name, value, options)
              // Set cookies with proper options for Netlify
              // Use the exact options from Supabase to ensure compatibility
              response.cookies.set(name, value, options || {})
            })
          },
        },
      })

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Failed to exchange code for session:', exchangeError)
        return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, request.url))
      }

      // Verify session was created before redirecting
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('Session not created after code exchange')
        return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent('Session creation failed')}`, request.url))
      }

      // Return response with cookies already set
      return response
    } catch (error) {
      console.error('Supabase auth callback failed:', error)
      return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent('Authentication failed')}`, request.url))
    }
  }

  // Fallback redirect
  const redirectPath = next || '/'
  return NextResponse.redirect(new URL(redirectPath, request.url))
}
