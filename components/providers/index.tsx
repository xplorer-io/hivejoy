'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { DevRoleSwitcher } from '@/components/dev/role-switcher';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <DevRoleSwitcher />
    </AuthProvider>
  );
}

