'use client';

import { useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAuthStore } from '@/lib/stores';
import { mapClerkUser } from '@/lib/api/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoaded } = useUser();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    if (user) {
      const mappedUser = mapClerkUser(user);
      setUser(mappedUser);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [user, isLoaded, setUser, setLoading]);

  return <>{children}</>;
}
