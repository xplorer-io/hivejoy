import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/admin/set-admin
 * Set a user as admin by email address
 * This is a one-time setup endpoint - should be secured or removed after use
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the user by email in auth.users using admin client
    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { success: false, error: 'Admin client not configured' },
        { status: 500 }
      );
    }
    
    const { data: authUser } = await adminClient.auth.admin.listUsers();
    const targetUser = authUser?.users.find(u => u.email === email);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: `User with email ${email} not found in auth.users` },
        { status: 404 }
      );
    }

    // Update or create profile with admin role using admin client
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: targetUser.id,
        email: email,
        role: 'admin',
        status: 'active',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return NextResponse.json(
        { success: false, error: `Failed to update profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been set as admin`,
      profile: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error('Error setting admin:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
