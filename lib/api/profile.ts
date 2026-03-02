'use server';

import { createClient } from '@/lib/supabase/server';
import type { User } from '@/types';

/**
 * Get user profile from profiles table.
 * Lightweight module for use in proxy.ts to avoid pulling in
 * the full database module and its heavy dependencies (SendGrid, etc.).
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    phone: data.phone || undefined,
    role: (data.role as User['role']) || 'consumer',
    status: (data.status as User['status']) || 'active',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
