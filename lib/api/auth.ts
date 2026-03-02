'use client';

import { createClient } from '@/lib/supabase/client'
import { isEmailFormat } from '@/lib/auth/disposable-email'
import type { User } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Map Supabase user to your User type
function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    phone: supabaseUser.phone,
    role: (supabaseUser.user_metadata?.role as User['role']) || 'consumer',
    status: supabaseUser.user_metadata?.status || 'active',
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
  }
}

/**
 * Sends OTP via the server-side API. Disposable-email check and Supabase signInWithOtp
 * run on the server so they cannot be bypassed; clients must not call signInWithOtp directly.
 */
export async function sendOTP(emailOrPhone: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone: emailOrPhone.trim() }),
      credentials: 'include',
    })
    const data = (await res.json()) as { success?: boolean; message?: string }
    const success = res.ok && data.success === true
    return {
      success,
      message: typeof data.message === 'string' ? data.message : (success ? 'OTP sent successfully' : 'Failed to send OTP'),
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP',
    }
  }
}

export async function verifyOTP(
  emailOrPhone: string,
  otp: string
): Promise<{ success: boolean; user?: User; message: string }> {
  try {
    const supabase = createClient()
    
    // Validate if it's an email using proper email format validation
    const isEmail = isEmailFormat(emailOrPhone)
    
    let result
    if (isEmail) {
      result = await supabase.auth.verifyOtp({
        email: emailOrPhone,
        token: otp,
        type: 'email',
      })
    } else {
      result = await supabase.auth.verifyOtp({
        phone: emailOrPhone,
        token: otp,
        type: 'sms',
      })
    }
    
    if (result.error) {
      return {
        success: false,
        message: result.error.message,
      }
    }
    
    if (!result.data.user) {
      return {
        success: false,
        message: 'User not found',
      }
    }
    
    // Ensure profile exists by calling the API endpoint
    // This will create the profile if it doesn't exist
    let user = mapSupabaseUser(result.data.user);
    if (typeof window !== 'undefined') {
      try {
        const profileResponse = await fetch('/api/auth/user', {
          credentials: 'include',
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.user) {
            user = profileData.user; // Use role from database
          } else {
            // Profile doesn't exist yet, it will be created on next request
            // For now, use the mapped user
            console.warn('Profile not found for user, will be created on next request');
          }
        } else {
          // If profile fetch fails, the profile will be created on next request
          console.warn('Failed to fetch profile, will be created automatically');
        }
      } catch (error) {
        console.error('Failed to fetch user role from database:', error);
        // Continue with default role if fetch fails
        // Profile will be created automatically on next request
      }
    }
    
    return {
      success: true,
      user,
      message: 'Verified successfully',
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP',
    }
  }
}

export async function getCurrentUser(userId: string): Promise<User | null> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user || user.id !== userId) {
      return null
    }
    
    return mapSupabaseUser(user)
  } catch {
    return null
  }
}

// New function to get current session
export async function getSession() {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch {
    return null
  }
}

// New function to sign out
export async function signOut() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return { success: !error, error: error?.message }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign out' 
    }
  }
}

// Social sign-in functions
export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
    return { success: !error, error: error?.message }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign in with Google' 
    }
  }
}

export async function signInWithFacebook(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${origin}/auth/callback`,
        scopes: 'email', // Explicitly request email permission
      },
    })
    return { success: !error, error: error?.message }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign in with Facebook' 
    }
  }
}

export async function signInWithApple(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
    return { success: !error, error: error?.message }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign in with Apple' 
    }
  }
}