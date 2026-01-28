import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = await createClient()
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      // If Supabase is not configured, just redirect
      console.warn('Supabase auth callback failed:', error)
    }
  }

  // Redirect to the home page or the next parameter
  return NextResponse.redirect(new URL(next, request.url))
}
