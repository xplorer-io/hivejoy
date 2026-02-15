import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/sellers
 * Get all sellers (approved producers) with their status
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

    // Check if user is admin
    // Try with regular client first, fallback to admin client if RLS blocks
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // If RLS blocks the query, use admin client to check role
    if (profileError || !profile) {
      const adminClient = createAdminClient();
      if (adminClient) {
        const adminProfileResult = await adminClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        profile = adminProfileResult.data;
        profileError = adminProfileResult.error;
      }
    }

    if (!profile || (profile as { role?: string }).role !== 'admin') {
      console.error('Admin check failed:', {
        hasProfile: !!profile,
        role: profile ? (profile as { role?: string }).role : 'none',
        userId: user.id,
        profileError: profileError?.message,
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin access required',
          details: profileError?.message || 'User role is not admin'
        },
        { status: 403 }
      );
    }

    // Fetch all producers with their profile status
    // Try with regular client first, fallback to admin client if RLS blocks
    let { data: sellers, error } = await supabase
      .from('producers')
      .select(`
        id,
        business_name,
        user_id,
        verification_status,
        application_status,
        created_at,
        profiles:user_id (
          id,
          email,
          role,
          status
        )
      `)
      .in('application_status', ['approved'])
      .order('created_at', { ascending: false });

    // If RLS blocks the query, use admin client
    if (error && (error.message?.includes('policy') || error.message?.includes('RLS') || error.message?.includes('permission'))) {
      console.warn('RLS blocked query, using admin client:', error.message);
      const adminClient = createAdminClient();
      if (adminClient) {
        const adminResult = await adminClient
          .from('producers')
          .select(`
            id,
            business_name,
            user_id,
            verification_status,
            application_status,
            created_at,
            profiles:user_id (
              id,
              email,
              role,
              status
            )
          `)
          .in('application_status', ['approved'])
          .order('created_at', { ascending: false });
        
        sellers = adminResult.data;
        error = adminResult.error;
      }
    }

    if (error) {
      console.error('Error fetching sellers:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch sellers',
          details: error.message || 'Unknown error'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sellers: sellers || [],
    });
  } catch (error) {
    console.error('Error in sellers API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
