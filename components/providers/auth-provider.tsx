'use client';

import { useEffect, ReactNode, useMemo } from 'react';
import { useAuthStore } from '@/lib/stores';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthProviderProps {
  children: ReactNode;
}

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    phone: supabaseUser.phone,
    role: (supabaseUser.user_metadata?.role as User['role']) || 'consumer',
    status: supabaseUser.user_metadata?.status || 'active',
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading } = useAuthStore();
  const supabase = useMemo(() => {
    // Only create client on the client side
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session from Supabase and fetch role from database
    supabase.auth.getSession().then(async ({ data }: { data: { session: { user: SupabaseUser } | null } }) => {
      if (data.session?.user) {
        // Fetch role from database
        try {
          const response = await fetch('/api/auth/user');
          const result = await response.json();
          if (result.success && result.user) {
            setUser(result.user);
          } else {
            // Fallback to basic user mapping if API fails
            setUser(mapSupabaseUser(data.session.user));
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
          // Fallback to basic user mapping
          setUser(mapSupabaseUser(data.session.user));
        }
      } else {
        // Clear any stale persisted state if no valid Supabase session
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: { user: SupabaseUser } | null) => {
      if (session?.user) {
        // Fetch role from database
        try {
          const response = await fetch('/api/auth/user');
          const result = await response.json();
          if (result.success && result.user) {
            setUser(result.user);
          } else {
            // Fallback to basic user mapping if API fails
            setUser(mapSupabaseUser(session.user));
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
          // Fallback to basic user mapping
          setUser(mapSupabaseUser(session.user));
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, supabase]);

  return <>{children}</>;
}