import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all producers with their profile status
    const { data: sellers, error } = await supabase
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

    if (error) {
      console.error('Error fetching sellers:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch sellers' },
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
