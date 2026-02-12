'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, ProducerProfile } from '@/types';
import type { AuthState } from '@/types/stores';
import { createClient } from '@/lib/supabase/client';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      producerProfile: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
      }),
      
      setProducerProfile: (producerProfile) => set({ producerProfile }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ 
          user: null, 
          producerProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      
      // Development helper to switch roles
      devSetRole: (role) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, role } });
        } else {
          // Create mock user for development
          set({
            user: {
              id: '00000000-0000-0000-0000-000000000001',
              email: `dev-${role}@hivejoy.com.au`,
              role,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            isAuthenticated: true,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'hive-joy-auth',
      partialize: (state) => ({ 
        user: state.user,
        producerProfile: state.producerProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);