'use client';

import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from './auth-provider';
import { DevRoleSwitcher } from '@/components/dev/role-switcher';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider
      signInUrl="/auth"
      signUpUrl="/auth/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <AuthProvider>
        {children}
        <DevRoleSwitcher />
      </AuthProvider>
    </ClerkProvider>
  );
}

