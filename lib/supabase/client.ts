'use client';

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Minimal type for mock client to avoid 'any'
// Includes all methods used in the codebase
type MockSupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: null }; error: null }>
    getUser: () => Promise<{ data: { user: null }; error: null }>
    onAuthStateChange: () => { data: { subscription: { unsubscribe: () => void } } }
    signOut: () => Promise<{ error: null }>
    signInWithOtp: () => Promise<{ error: { message: string } }>
    verifyOtp: () => Promise<{ data: { user: null }; error: { message: string } }>
    updateUser: () => Promise<{ error: { message: string } }>
    signInWithOAuth: () => Promise<{ error: { message: string } }>
  }
}

function createMockClient(): MockSupabaseClient {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithOtp: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      verifyOtp: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
      updateUser: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signInWithOAuth: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
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