'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { PostHogProvider } from './posthog-provider';
import { DevRoleSwitcher } from '@/app/dev/components/role-switcher';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PostHogProvider>
      <AuthProvider>
        {children}
        <DevRoleSwitcher />
      </AuthProvider>
    </PostHogProvider>
  );
}

