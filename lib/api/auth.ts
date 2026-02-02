'use client';

import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Validate email format using a proper regex pattern
function isValidEmail(email: string): boolean {
  // RFC 5322 compliant email regex (simplified but robust)
  // Matches: user@domain.com, user.name@domain.co.uk, etc.
  // Rejects: strings with @ but invalid format, phone numbers with @, etc.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

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

export async function sendOTP(emailOrPhone: string): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()
  
  try {
    // Validate if it's an email using proper email format validation
    const isEmail = isValidEmail(emailOrPhone)
    
    if (isEmail) {
      // Request OTP code (not magic link) by not providing emailRedirectTo
      // and ensuring the email template in Supabase is configured for OTP
      const { error } = await supabase.auth.signInWithOtp({
        email: emailOrPhone,
        options: {
          shouldCreateUser: true,
          // Don't set emailRedirectTo - this forces OTP mode instead of magic link
        },
      })
      
      if (error) {
        // Provide user-friendly error messages
        let userMessage = error.message;
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          userMessage = 'Too many requests. Please wait a few minutes before trying again.';
        }
        return {
          success: false,
          message: userMessage,
        }
      }
    } else {
      // For phone number OTP
      const { error } = await supabase.auth.signInWithOtp({
        phone: emailOrPhone,
        options: {
          shouldCreateUser: true,
        },
      })
      
      if (error) {
        return {
          success: false,
          message: error.message,
        }
      }
    }
    
    return {
      success: true,
      message: 'OTP sent successfully',
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
  const supabase = createClient()
  
  try {
    // Validate if it's an email using proper email format validation
    const isEmail = isValidEmail(emailOrPhone)
    
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
    
    const user = mapSupabaseUser(result.data.user)
    
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
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user || user.id !== userId) {
      return null
    }
    
    return mapSupabaseUser(user)
  } catch {
    return null
  }
}

// Development helper to switch roles
export async function devSwitchRole(userId: string, role: User['role']): Promise<User | null> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userId) {
      return null
    }
    
    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        role,
      },
    })
    
    if (error) {
      return null
    }
    
    // Fetch updated user
    const { data: { user: updatedUser } } = await supabase.auth.getUser()
    
    if (!updatedUser) {
      return null
    }
    
    return mapSupabaseUser(updatedUser)
  } catch {
    return null
  }
}

// New function to get current session
export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// New function to sign out
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { success: !error, error: error?.message }
}

// Social sign-in functions
export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })
  return { success: !error, error: error?.message }
}

export async function signInWithFacebook(): Promise<{ success: boolean; error?: string }> {
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
}

export async function signInWithApple(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })
  return { success: !error, error: error?.message }
}