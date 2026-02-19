'use client';

import { Suspense, ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { PostHogProvider } from './posthog-provider';
import { DevRoleSwitcher } from '@/components/dev/role-switcher';
import { AuthErrorRedirect } from '@/components/auth/auth-error-redirect';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PostHogProvider>
      <AuthProvider>
        <Suspense fallback={null}>
          <AuthErrorRedirect />
        </Suspense>
        {children}
        <DevRoleSwitcher />
      </AuthProvider>
    </PostHogProvider>
  );
}

