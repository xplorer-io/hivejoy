import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Debug endpoint to check all producers and their application status
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

    // Fetch ALL producers with their status
    const { data: producers, error } = await supabase
      .from('producers')
      .select(`
        id,
        business_name,
        user_id,
        application_status,
        verification_status,
        application_submitted_at,
        created_at,
        profiles:user_id (
          id,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching producers:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch producers', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: producers?.length || 0,
      producers: producers || [],
    });
  } catch (error) {
    console.error('Error in debug producers API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
