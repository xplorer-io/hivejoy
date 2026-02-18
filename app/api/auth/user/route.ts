import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/api/database';

type ProfileResponse = { id: string; email: string; phone?: string; role: 'consumer' | 'producer' | 'admin'; status: string; createdAt: string; updatedAt: string };

function mapProfileRow(row: { id: string; email: string; phone?: string | null; role?: string | null; status?: string | null; created_at: string; updated_at: string }): ProfileResponse {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone ?? undefined,
    role: (row.role as 'consumer' | 'producer' | 'admin') || 'consumer',
    status: (row.status as string) || 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get current authenticated user's profile with role from database.
 * Uses admin client when available so the role is always current (e.g. after admin approves seller).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Prefer admin client so we always get the latest role from DB (bypasses RLS/cache)
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();
    let profile: ProfileResponse | null = null;

    if (adminClient) {
      const { data: adminProfile } = await adminClient
        .from('profiles')
        .select('id, email, phone, role, status, created_at, updated_at')
        .eq('id', user.id)
        .single();
      if (adminProfile) {
        profile = mapProfileRow(adminProfile);
      }
    }

    if (!profile) {
      profile = await getUserProfile(user.id);
    }

    // If profile doesn't exist, create it
    if (!profile) {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const adminClient = createAdminClient();
      
      const userEmail = user.email || '';
      
      if (adminClient) {
        const { data: newProfile, error: createError } = await adminClient
          .from('profiles')
          .upsert({
            id: user.id,
            email: userEmail,
            role: 'consumer',
            status: 'active',
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (!createError && newProfile) {
          profile = mapProfileRow(newProfile);
        } else {
          console.error('Failed to create profile:', createError);
          const { data: fallbackProfile, error: fallbackError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: userEmail,
              role: 'consumer',
              status: 'active',
            }, {
              onConflict: 'id'
            })
            .select()
            .single();

          if (!fallbackError && fallbackProfile) {
            profile = mapProfileRow(fallbackProfile);
          }
        }
      } else {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: userEmail,
            role: 'consumer',
            status: 'active',
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (!createError && newProfile) {
          profile = mapProfileRow(newProfile);
        }
      }
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found and could not be created' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, user: profile },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
