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

