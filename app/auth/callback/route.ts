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
              // Ensure options are properly formatted for Netlify
              if (options) {
                // Preserve all options but ensure they're set correctly for production
                const cookieOptions: {
                  domain?: string
                  path?: string
                  maxAge?: number
                  httpOnly?: boolean
                  secure?: boolean
                  sameSite?: 'lax' | 'strict' | 'none'
                } = {
                  ...options,
                  // Ensure path is set (default to /)
                  path: options.path || '/',
                  // Ensure SameSite is set for cross-site requests
                  sameSite: (options.sameSite as 'lax' | 'strict' | 'none') || 'lax',
                  // Ensure Secure is set in production (Netlify uses HTTPS)
                  secure: process.env.NODE_ENV === 'production' ? true : (options.secure !== false),
                  // Ensure HttpOnly is preserved
                  httpOnly: options.httpOnly !== false,
                }
                response.cookies.set(name, value, cookieOptions)
              } else {
                // Default options for cookies
                response.cookies.set(name, value, {
                  path: '/',
                  sameSite: 'lax',
                  secure: process.env.NODE_ENV === 'production',
                  httpOnly: true,
                })
              }
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
