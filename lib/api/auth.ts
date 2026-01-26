'use client';

import type { User } from '@/types';
import type { UserResource } from '@clerk/types';

// Map Clerk user to your User type
export function mapClerkUser(clerkUser: UserResource | null | undefined): User | null {
  if (!clerkUser) return null;

  // Get role from public metadata or default to 'consumer'
  const role = (clerkUser.publicMetadata?.role as User['role']) || 'consumer';

  // Check if user is banned (Clerk uses publicMetadata or other fields)
  const isBanned = clerkUser.publicMetadata?.banned === true;

  return {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    phone: clerkUser.phoneNumbers[0]?.phoneNumber || undefined,
    role,
    status: isBanned ? 'banned' : 'active',
    createdAt: clerkUser.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: clerkUser.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// Get current user from Clerk
export async function getCurrentUser(): Promise<User | null> {
  // This is a client-side function, so we'll use the hook in components
  // For server-side, use auth() from @clerk/nextjs/server
  return null;
}

// Sign out function
export async function signOut() {
  // This will be handled by Clerk's useAuth hook
  return { success: true };
}

// Note: Clerk handles OTP and social sign-in through their UI components
// These functions are kept for API compatibility but Clerk manages the flow

export async function sendOTP(_emailOrPhone: string): Promise<{ success: boolean; message: string }> {
  return {
    success: false,
    message: 'Please use Clerk sign-in components',
  };
}

export async function verifyOTP(
  _emailOrPhone: string,
  _otp: string
): Promise<{ success: boolean; user?: User; message: string }> {
  return {
    success: false,
    message: 'Please use Clerk sign-in components',
  };
}
