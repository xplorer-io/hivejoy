# Complete Authentication Setup Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Environment Variables](#environment-variables)
5. [Google OAuth Setup](#google-oauth-setup)
6. [NextAuth Configuration](#nextauth-configuration)
7. [TypeScript Types](#typescript-types)
8. [Zustand Store Setup](#zustand-store-setup)
9. [Provider Setup](#provider-setup)
10. [Auth Page Implementation](#auth-page-implementation)
11. [Session Synchronization](#session-synchronization)
12. [Header Integration](#header-integration)
13. [Dual Authentication System](#dual-authentication-system)
14. [How It Works](#how-it-works)
15. [Troubleshooting](#troubleshooting)

---

## Overview

Hive Joy uses a **dual authentication system**:
1. **OAuth Authentication** (Google) - via NextAuth.js v5
2. **Email/OTP Authentication** - custom implementation for development

The system combines:
- **NextAuth.js v5** for OAuth session management
- **Zustand** for client-side state management
- **Global session synchronization** between NextAuth and Zustand

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Authentication                    │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼───────┐      ┌───────▼───────┐
        │  Google OAuth  │      │  Email/OTP    │
        │  (NextAuth)    │      │  (Custom)     │
        └───────┬───────┘      └───────┬───────┘
                │                       │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │   NextAuth Session     │
                │   (Server-side)        │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │   AuthProvider        │
                │   (Global Sync)       │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │   Zustand Store        │
                │   (Client-side)        │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │   Header Component    │
                │   (UI Display)         │
                └───────────────────────┘
```

---

## Prerequisites

### 1. Install Dependencies

```bash
npm install next-auth@beta
npm install zustand
```

### 2. Required Packages

- `next-auth@5.0.0-beta.30` - Authentication framework
- `zustand@^5.0.9` - State management
- `@auth/core@^0.41.0` - Core auth utilities

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# NextAuth Configuration
AUTH_SECRET=your-secret-key-here
AUTH_TRUST_HOST=true

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: For production
# NEXTAUTH_URL=https://yourdomain.com
```

### Generate AUTH_SECRET

```bash
# Option 1: Using NextAuth CLI
npx auth secret

# Option 2: Using OpenSSL
openssl rand -base64 32
```

**Important:** 
- `AUTH_SECRET` is required for NextAuth v5
- `AUTH_TRUST_HOST=true` is needed for localhost development
- Never commit `.env.local` to version control

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** (or Google Identity Services)

### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: Hive Joy (or your app name)
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

### Step 3: Get Credentials

1. Copy the **Client ID** → `GOOGLE_CLIENT_ID`
2. Copy the **Client Secret** → `GOOGLE_CLIENT_SECRET`
3. Add to `.env.local`

---

## NextAuth Configuration

### File: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { UserRole } from "@/types"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user ID and role to JWT token
      if (user) {
        token.id = user.id
        token.role = (user.role as UserRole) || 'consumer'
      }
      return token
    },
    async session({ session, token }) {
      // Add user ID and role to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth', // Custom sign-in page
  },
})

// Export GET and POST handlers for NextAuth API routes
export const { GET, POST } = handlers
```

**Key Points:**
- Uses NextAuth v5 App Router pattern
- Custom callbacks to add `id` and `role` to session
- Custom sign-in page at `/auth`

---

## TypeScript Types

### File: `types/next-auth.d.ts`

Extend NextAuth types to include custom fields:

```typescript
import 'next-auth'
import type { UserRole } from './index'

declare module 'next-auth' {
  interface User {
    id: string
    role?: UserRole
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role?: UserRole
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: UserRole
  }
}
```

This allows TypeScript to recognize `id` and `role` in sessions and tokens.

---

## Zustand Store Setup

### File: `lib/stores/auth-store.ts`

```typescript
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, ProducerProfile } from '@/types';

interface AuthState {
  user: User | null;
  producerProfile: ProducerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProducerProfile: (profile: ProducerProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  
  // Dev helpers
  devSetRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      producerProfile: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
      }),
      
      setProducerProfile: (producerProfile) => set({ producerProfile }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({ 
        user: null, 
        producerProfile: null,
        isAuthenticated: false,
        isLoading: false,
      }),
      
      // Development helper to switch roles
      devSetRole: (role) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, role } });
        } else {
          // Create mock user for development
          set({
            user: {
              id: 'dev-user',
              email: `dev-${role}@hivejoy.com.au`,
              role,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            isAuthenticated: true,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'hive-joy-auth', // localStorage key
      partialize: (state) => ({ 
        user: state.user,
        producerProfile: state.producerProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

**Key Features:**
- Persists to localStorage (survives page refresh)
- Tracks user, authentication state, and loading state
- Includes development helper for role switching

---

## Provider Setup

### File: `components/providers/session-provider.tsx`

Wraps app with NextAuth SessionProvider:

```typescript
'use client'

import { SessionProvider } from "next-auth/react"

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}
```

### File: `components/providers/auth-provider.tsx`

**Global session synchronization** - This is the key component:

```typescript
'use client';

import { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores';
import type { UserRole } from '@/types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const { setUser, setLoading } = useAuthStore();

  // Sync NextAuth session with Zustand store globally
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    setLoading(false);

    if (session?.user) {
      setUser({
        id: session.user.id || `user-${Date.now()}`,
        email: session.user.email || '',
        role: (session.user.role as UserRole) || 'consumer',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Clear user if session is null (signed out)
      setUser(null);
    }
  }, [session, status, setUser, setLoading]);

  return <>{children}</>;
}
```

**This component:**
- Monitors NextAuth session globally
- Syncs session data to Zustand store
- Works on all pages, not just auth page
- Handles loading states and sign out

### File: `components/providers/index.tsx`

Combines all providers:

```typescript
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { AuthSessionProvider } from './session-provider';
import { DevRoleSwitcher } from '@/components/dev/role-switcher';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthSessionProvider>
      <AuthProvider>
        {children}
        <DevRoleSwitcher />
      </AuthProvider>
    </AuthSessionProvider>
  );
}
```

### File: `app/layout.tsx`

Wrap the app with Providers:

```typescript
import { Providers } from "@/components/providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## Auth Page Implementation

### File: `app/auth/page.tsx`

The sign-in page supports both OAuth and Email/OTP:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores';
import { sendOTP, verifyOTP } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { data: session, status } = useSession();
  
  // Redirect if already signed in (session sync handled globally)
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/');
    }
  }, [session, status, router]);

  // Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      // Handle error
    }
  };

  // Email/OTP sign-in (custom implementation)
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await sendOTP(email);
    if (result.success) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verifyOTP(email, otp);
    if (result.success && result.user) {
      setUser(result.user);
      router.push('/');
    }
  };

  return (
    // UI with Google OAuth button and Email/OTP form
  );
}
```

---

## Session Synchronization

### The Problem We Solved

**Before:** Session sync only happened on `/auth` page, causing header to not update immediately after OAuth redirect.

**After:** Global session sync in `AuthProvider` ensures:
- Session syncs on all pages
- Header updates immediately after OAuth
- No need to click "Sign In" again

### How It Works

1. User signs in with Google → NextAuth creates session
2. `AuthProvider` detects session change via `useSession()`
3. Syncs session data to Zustand store
4. Header component checks both sources and updates UI

---

## Header Integration

### File: `components/shared/header.tsx`

Header checks both Zustand and NextAuth session:

```typescript
'use client';

import { signOut, useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/stores';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: session } = useSession(); // Check NextAuth directly

  // Fallback: use NextAuth session if Zustand hasn't synced yet
  const isUserAuthenticated = isAuthenticated || !!session?.user;
  const displayUser = user || (session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    role: session.user.role || 'consumer',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } : null);

  const handleSignOut = async () => {
    logout();
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header>
      {isUserAuthenticated ? (
        // Show user menu
      ) : (
        // Show Sign In button
      )}
    </header>
  );
}
```

**Key Points:**
- Checks both Zustand store AND NextAuth session
- Updates immediately even if Zustand sync is delayed
- Handles sign out for both systems

---

## Dual Authentication System

### 1. OAuth Authentication (Google)

**Flow:**
1. User clicks "Continue with Google"
2. Redirected to Google sign-in
3. Google redirects back with authorization code
4. NextAuth exchanges code for tokens
5. Creates session and JWT
6. Session synced to Zustand via `AuthProvider`

**Files:**
- `app/api/auth/[...nextauth]/route.ts` - NextAuth config
- `app/auth/page.tsx` - OAuth button handler

### 2. Email/OTP Authentication

**Flow:**
1. User enters email
2. System sends OTP (mock in development)
3. User enters OTP
4. System verifies OTP
5. Creates/finds user in mock data
6. Sets user in Zustand store directly

**Files:**
- `lib/api/auth.ts` - OTP send/verify functions
- `app/auth/page.tsx` - OTP form handlers

**Note:** OTP system is mock implementation for development. In production, this would connect to a real backend/email service.

---

## How It Works

### Complete Authentication Flow

```
1. User visits app
   └─> Providers wrap app
       ├─> AuthSessionProvider (NextAuth)
       └─> AuthProvider (syncs session to Zustand)

2. User clicks "Sign In" in Header
   └─> Navigates to /auth

3. User chooses authentication method:

   Option A: Google OAuth
   ├─> Click "Continue with Google"
   ├─> Redirect to Google
   ├─> User signs in with Google
   ├─> Google redirects to /api/auth/callback/google
   ├─> NextAuth creates session
   ├─> AuthProvider detects session
   ├─> Syncs to Zustand store
   ├─> Redirects to /
   └─> Header shows user menu immediately

   Option B: Email/OTP
   ├─> Enter email
   ├─> System sends OTP (mock)
   ├─> Enter OTP
   ├─> System verifies OTP
   ├─> Sets user in Zustand store
   ├─> Redirects to /
   └─> Header shows user menu

4. User is authenticated
   ├─> Zustand store has user data
   ├─> NextAuth session exists (if OAuth)
   └─> Header displays user menu

5. User clicks "Sign Out"
   ├─> Clears Zustand store
   ├─> Clears NextAuth session
   └─> Redirects to /
```

### Session State Management

```
NextAuth Session (Server-side)
    │
    ├─> Stored in HTTP-only cookie
    ├─> Managed by NextAuth
    └─> Accessible via useSession() hook

Zustand Store (Client-side)
    │
    ├─> Persisted to localStorage
    ├─> Managed by Zustand
    └─> Accessible via useAuthStore() hook

AuthProvider (Bridge)
    │
    ├─> Monitors NextAuth session
    ├─> Syncs to Zustand store
    └─> Keeps both in sync
```

---

## Troubleshooting

### Issue: "AUTH_SECRET is missing"

**Solution:**
```bash
# Generate secret
npx auth secret

# Add to .env.local
AUTH_SECRET=generated-secret-here
```

### Issue: "Host must be trusted"

**Solution:**
Add to `.env.local`:
```env
AUTH_TRUST_HOST=true
```

### Issue: OAuth redirect fails

**Check:**
1. Google Console redirect URI matches exactly:
   - `http://localhost:3000/api/auth/callback/google`
2. Client ID and Secret are correct in `.env.local`
3. Google+ API is enabled in Google Cloud Console

### Issue: Header doesn't update after sign-in

**Solution:**
- Ensure `AuthProvider` wraps your app in `app/layout.tsx`
- Check that `useSession()` is working (check browser console)
- Verify Zustand store is being updated (check localStorage)

### Issue: Session lost on page refresh

**Check:**
1. Zustand persist is configured correctly
2. localStorage is enabled in browser
3. No browser extensions blocking localStorage

### Issue: TypeScript errors for session.user.id

**Solution:**
Ensure `types/next-auth.d.ts` is properly configured and TypeScript recognizes the file.

---

## File Structure Summary

```
hivejoy/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth configuration
│   ├── auth/
│   │   └── page.tsx                  # Sign-in page (OAuth + OTP)
│   └── layout.tsx                    # Root layout with Providers
├── components/
│   ├── providers/
│   │   ├── index.tsx                # Combined providers
│   │   ├── auth-provider.tsx         # Global session sync
│   │   └── session-provider.tsx     # NextAuth SessionProvider
│   └── shared/
│       └── header.tsx               # Header with auth state
├── lib/
│   ├── api/
│   │   └── auth.ts                   # OTP functions (mock)
│   └── stores/
│       └── auth-store.ts             # Zustand auth store
├── types/
│   └── next-auth.d.ts                # NextAuth type extensions
└── .env.local                        # Environment variables
```

---

## Key Takeaways

1. **Dual System**: OAuth (NextAuth) + Email/OTP (custom)
2. **Global Sync**: `AuthProvider` syncs NextAuth → Zustand on all pages
3. **Fallback Logic**: Header checks both sources for immediate updates
4. **Persistence**: Zustand persists to localStorage, NextAuth uses cookies
5. **Type Safety**: TypeScript types extended for custom fields

---

## Next Steps

For production:
1. Replace mock OTP system with real backend
2. Add database integration for user storage
3. Implement proper role assignment logic
4. Add email verification
5. Set up proper error handling and logging
6. Configure production OAuth redirect URIs
7. Add rate limiting for OTP requests

---

**Last Updated:** January 2025
