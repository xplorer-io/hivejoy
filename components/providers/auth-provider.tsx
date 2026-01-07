'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/lib/stores';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    // Hydration complete - set loading to false
    setLoading(false);
  }, [setLoading]);

  return <>{children}</>;
}

