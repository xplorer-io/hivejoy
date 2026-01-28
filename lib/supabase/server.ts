import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

// Minimal type for mock client to avoid 'any'
type MockSupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: null }; error: null }>
    getUser: () => Promise<{ data: { user: null }; error: null }>
    signOut: () => Promise<{ error: null }>
    onAuthStateChange: () => { data: { subscription: { unsubscribe: () => void } } }
    exchangeCodeForSession: () => Promise<{ data: { session: null }; error: null }>
  }
}

function createMockClient(): MockSupabaseClient {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      exchangeCodeForSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
  }
}

// Lazy import to prevent evaluation during build
async function getCreateServerClient() {
  const { createServerClient } = await import('@supabase/ssr')
  return createServerClient
}

export async function createClient(): Promise<SupabaseClient | MockSupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build, if env vars are missing, return a safe mock
  if (!supabaseUrl || !supabaseKey) {
    // Return a mock client that won't break during build
    return createMockClient()
  }

  // Double-check env vars are valid (not empty strings)
  // Return mock immediately if missing to prevent createServerClient validation errors
  if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === '' || supabaseKey.trim() === '') {
    return createMockClient()
  }

  try {
    const cookieStore = await cookies()
    const createServerClient = await getCreateServerClient()

    // Final validation - createServerClient will throw if these are invalid
    // We've already checked above, but this is a safety net
    if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === '' || supabaseKey.trim() === '') {
      throw new Error('Missing Supabase credentials')
    }

    return createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
  } catch {
    // If createServerClient fails (e.g., during build), return a safe mock
    return createMockClient()
  }
}
