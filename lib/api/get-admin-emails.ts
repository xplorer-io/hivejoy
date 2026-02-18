import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Fetch all admin user emails from profiles (role = 'admin').
 * Used for sending new seller registration notifications to all admins.
 */
export async function getAdminEmails(): Promise<string[]> {
  const adminClient = createAdminClient();
  if (!adminClient) return [];

  const { data, error } = await adminClient
    .from('profiles')
    .select('email')
    .eq('role', 'admin');

  if (error) {
    console.error('Failed to fetch admin emails:', error);
    return [];
  }

  const emails = (data || [])
    .map((p) => (p as { email?: string }).email)
    .filter((e): e is string => typeof e === 'string' && e.length > 0);

  return [...new Set(emails)];
}
