import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/types'

// Lazy import to prevent evaluation during build
async function getCreateServerClient() {
  const { createServerClient } = await import('@supabase/ssr')
  return createServerClient
}

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

/**
 * Check if a path requires authentication
 */
function requiresAuth(pathname: string): boolean {
  const protectedPaths = [
    '/seller',
    '/admin',
    '/profile',
    '/orders',
    '/cart',
  ]
  return protectedPaths.some((path) => pathname.startsWith(path))
}

/**
 * Check if a path requires a specific role
 */
function requiresRole(pathname: string): UserRole | null {
  // Allow consumers to access seller registration/apply pages
  const isSellerRegistrationPage = pathname.startsWith('/seller/register') || pathname.startsWith('/seller/apply');
  
  if (pathname.startsWith('/seller') && !isSellerRegistrationPage) {
    return 'producer'
  }
  if (pathname.startsWith('/admin')) {
    return 'admin'
  }
  return null
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build or if env vars are missing/empty, just pass through
  // This prevents Supabase client from being created during static generation
  if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === '' || supabaseKey.trim() === '') {
    // Still handle route protection even without Supabase (for /auth redirect)
    if (pathname === '/auth') {
      return NextResponse.redirect(new URL('/auth/consumer', request.url))
    }
    return supabaseResponse
  }

  // Handle auth page redirects - redirect /auth to /auth/consumer
  if (pathname === '/auth') {
    return NextResponse.redirect(new URL('/auth/consumer', request.url))
  }

  // Allow public paths (except auth routes that need redirects)
  const publicPaths = [
    '/auth',
    '/api',
    '/_next',
    '/favicon.ico',
    '/',
    '/products',
    '/producers',
    '/policies',
    '/about',
  ]

  // Skip route protection for public paths
  if (publicPaths.some((path) => pathname.startsWith(path)) && !pathname.startsWith('/auth/')) {
    // Still refresh Supabase session for public paths
    try {
      const createServerClient = await getCreateServerClient()
      const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )
      await supabase.auth.getUser()
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Supabase client creation failed, continuing without auth:', error)
      }
    }
    return supabaseResponse
  }

  // Check if route requires authentication
  if (!requiresAuth(pathname)) {
    // Still refresh Supabase session
    try {
      const createServerClient = await getCreateServerClient()
      const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )
      await supabase.auth.getUser()
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Supabase client creation failed, continuing without auth:', error)
      }
    }
    return supabaseResponse
  }

  // Protected routes - need authentication and role checking
  try {
    const createServerClient = await getCreateServerClient()

    // Final validation before calling (createServerClient validates parameters strictly)
    if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === '' || supabaseKey.trim() === '') {
      return supabaseResponse
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser()

    // If not authenticated, redirect to appropriate login page
    if (error || !user) {
      const requiredRole = requiresRole(pathname)
      const loginPath = requiredRole === 'producer' 
        ? '/auth/producer' 
        : requiredRole === 'admin'
        ? '/auth/admin'
        : '/auth/consumer'
      
      const redirectUrl = new URL(loginPath, request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Fetch user role from database
    try {
      const { getUserProfile } = await import('@/lib/api/database')
      const profile = await getUserProfile(user.id)

      if (!profile) {
        // User exists but no profile - redirect to consumer login
        const redirectUrl = new URL('/auth/consumer', request.url)
        redirectUrl.searchParams.set('error', 'Profile not found')
        return NextResponse.redirect(redirectUrl)
      }

      // Check if user has required role for this route
      const requiredRole = requiresRole(pathname)
      if (requiredRole && profile.role !== requiredRole && profile.role !== 'admin') {
        // Admin can access all routes, but others need specific role
        const redirectUrl = new URL(getRedirectPath(profile.role), request.url)
        redirectUrl.searchParams.set('error', 'Insufficient permissions')
        return NextResponse.redirect(redirectUrl)
      }
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError)
      // On error, allow access but log the issue
    }

    // Allow access
    return supabaseResponse
  } catch (error) {
    // If Supabase client creation fails (e.g., during build), just pass through
    // This prevents build failures when env vars are not set
    // Only log in non-production builds to avoid noise
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase client creation failed, continuing without auth:', error)
    }
    
    // On error for protected routes, redirect to login
    if (requiresAuth(pathname)) {
      return NextResponse.redirect(new URL('/auth/consumer', request.url))
    }
    
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
