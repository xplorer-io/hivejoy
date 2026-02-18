import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

// Minimal type for mock client to avoid 'any'
// Includes all methods used in the codebase
// Method signatures accept parameters to match real Supabase v2 types
type MockQueryResponse<T = unknown> = {
  data: T | null
  error: { message: string } | null
  count?: number | null
}

type MockQueryBuilder = {
  select: (..._args: unknown[]) => MockQueryBuilder
  insert: (..._args: unknown[]) => MockQueryBuilder
  update: (..._args: unknown[]) => MockQueryBuilder
  upsert: (..._args: unknown[]) => MockQueryBuilder
  delete: (..._args: unknown[]) => MockQueryBuilder
  eq: (..._args: unknown[]) => MockQueryBuilder
  neq: (..._args: unknown[]) => MockQueryBuilder
  gt: (..._args: unknown[]) => MockQueryBuilder
  gte: (..._args: unknown[]) => MockQueryBuilder
  lt: (..._args: unknown[]) => MockQueryBuilder
  lte: (..._args: unknown[]) => MockQueryBuilder
  like: (..._args: unknown[]) => MockQueryBuilder
  ilike: (..._args: unknown[]) => MockQueryBuilder
  is: (..._args: unknown[]) => MockQueryBuilder
  in: (..._args: unknown[]) => MockQueryBuilder
  contains: (..._args: unknown[]) => MockQueryBuilder
  or: (..._args: unknown[]) => MockQueryBuilder
  order: (..._args: unknown[]) => MockQueryBuilder
  limit: (..._args: unknown[]) => MockQueryBuilder
  range: (..._args: unknown[]) => MockQueryBuilder
  single: () => Promise<MockQueryResponse>
  maybeSingle: () => Promise<MockQueryResponse>
  then: (onResolve?: (value: MockQueryResponse) => unknown) => Promise<MockQueryResponse>
}

type MockSupabaseClient = {
  auth: {
    getSession: (..._args: unknown[]) => Promise<{ data: { session: null }; error: null }>
    getUser: (..._args: unknown[]) => Promise<{ data: { user: null }; error: null }>
    signOut: (..._args: unknown[]) => Promise<{ error: null }>
    onAuthStateChange: (..._args: unknown[]) => { data: { subscription: { unsubscribe: () => void } } }
    exchangeCodeForSession: (..._args: unknown[]) => Promise<{ data: { session: null }; error: null }>
    signInWithOtp: (..._args: unknown[]) => Promise<{ error: { message: string } }>
    verifyOtp: (..._args: unknown[]) => Promise<{ data: { user: null }; error: { message: string } }>
    updateUser: (..._args: unknown[]) => Promise<{ error: { message: string } }>
    signInWithOAuth: (..._args: unknown[]) => Promise<{ error: { message: string } }>
  }
  from: (table: string) => MockQueryBuilder
}

function createMockQueryBuilder(): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    upsert: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    like: () => builder,
    ilike: () => builder,
    is: () => builder,
    in: () => builder,
    contains: () => builder,
    or: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' }, count: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' }, count: null }),
    // biome-ignore lint/suspicious/noThenProperty: Intentional thenable mock for Supabase query builder compatibility
    then: (onResolve) => {
      const result: MockQueryResponse = { data: [], error: { message: 'Supabase not configured' }, count: 0 };
      if (onResolve) {
        const resolved = onResolve(result);
        return Promise.resolve(typeof resolved === 'object' && resolved !== null && 'data' in resolved ? resolved as MockQueryResponse : result);
      }
      return Promise.resolve(result);
    },
  };
  return builder;
}

function createMockClient(): MockSupabaseClient {
  return {
    auth: {
      getSession: (..._args: unknown[]) => Promise.resolve({ data: { session: null }, error: null }),
      getUser: (..._args: unknown[]) => Promise.resolve({ data: { user: null }, error: null }),
      signOut: (..._args: unknown[]) => Promise.resolve({ error: null }),
      onAuthStateChange: (..._args: unknown[]) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      exchangeCodeForSession: (..._args: unknown[]) => Promise.resolve({ data: { session: null }, error: null }),
      signInWithOtp: (..._args: unknown[]) => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      verifyOtp: (..._args: unknown[]) => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      updateUser: (..._args: unknown[]) => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signInWithOAuth: (..._args: unknown[]) => Promise.resolve({ error: { message: 'Supabase not configured' } }),
    },
    from: () => createMockQueryBuilder(),
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
