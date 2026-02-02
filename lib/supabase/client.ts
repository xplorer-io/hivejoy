'use client';

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Minimal type for mock client to avoid 'any'
// Includes all methods used in the codebase
// Method signatures accept parameters to match real Supabase v2 types
type MockSupabaseClient = {
  auth: {
    getSession: (..._args: unknown[]) => Promise<{ data: { session: null }; error: null }>
    getUser: (..._args: unknown[]) => Promise<{ data: { user: null }; error: null }>
    onAuthStateChange: (..._args: unknown[]) => { data: { subscription: { unsubscribe: () => void } } }
    signOut: (..._args: unknown[]) => Promise<{ error: null }>
    signInWithOtp: (..._args: unknown[]) => Promise<{ error: { message: string } }>
    verifyOtp: (..._args: unknown[]) => Promise<{ data: { user: null }; error: { message: string } }>
    updateUser: (..._args: unknown[]) => Promise<{ error: { message: string } }>
    signInWithOAuth: (..._args: unknown[]) => Promise<{ error: { message: string } }>
  }
}

function createMockClient(): MockSupabaseClient {
  return {
    auth: {
      getSession: (..._args: unknown[]) => Promise.resolve({ data: { session: null }, error: null }),
      getUser: (..._args: unknown[]) => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: (..._args: unknown[]) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: (..._args: unknown[]) => Promise.resolve({ error: null }),
      signInWithOtp: (..._args: unknown[]) => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      verifyOtp: (..._args: unknown[]) => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      updateUser: (..._args: unknown[]) => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signInWithOAuth: (..._args: unknown[]) => Promise.resolve({ error: { message: 'Supabase not configured' } }),
    },
  }
}

export function createClient(): SupabaseClient | MockSupabaseClient {
  // During build, environment variables might not be available
  // Return a safe fallback that won't break the build
  if (typeof window === 'undefined') {
    // Server-side or build time - return a mock client structure
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    if (!supabaseUrl || !supabaseKey) {
      // Return a minimal mock that won't break during build
      return createMockClient()
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}