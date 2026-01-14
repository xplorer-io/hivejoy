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

