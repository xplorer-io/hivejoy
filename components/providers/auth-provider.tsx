'use client';

import { useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuthStore } from '@/lib/stores';
import type { User } from '@/types';

interface AuthProviderProps {
  children: ReactNode;
}

function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  // Note: customClaims requires Firebase Admin SDK to set
  // For now, default to 'consumer' role
  const role: User['role'] = 'consumer';
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    phone: firebaseUser.phoneNumber || undefined,
    role,
    status: 'active',
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    updatedAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}