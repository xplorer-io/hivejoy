import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/api/database'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@/types'

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
      const supabase = await createClient()
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
          return NextResponse.redirect(new URL(redirectPath, request.url))
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
