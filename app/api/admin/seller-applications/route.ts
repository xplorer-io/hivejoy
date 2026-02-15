import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/seller-applications
 * Get all seller applications pending review
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

    // Fetch all producers with pending_review status
    // Also include NULL application_status (for applications created before migration)
    // Also include any producer with verification_status = 'pending' (legacy check)
    const { data: allProducers, error: allError } = await supabase
      .from('producers')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('Error fetching all producers:', allError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch applications', details: allError.message },
        { status: 500 }
      );
    }

    // Filter to only pending applications
    interface ProducerWithStatus {
      application_status: string | null;
      verification_status: string | null;
      [key: string]: unknown;
    }
    const producersArray = Array.isArray(allProducers) ? allProducers : [];
    const applications = producersArray.filter((producer: ProducerWithStatus) => {
      const appStatus = producer.application_status;
      const verStatus = producer.verification_status;
      
      // Include if:
      // 1. application_status is 'pending_review' or 'changes_requested'
      // 2. application_status is NULL and verification_status is 'pending' (legacy)
      // 3. application_status is NULL and no verification_status set (new applications)
      return (
        appStatus === 'pending_review' ||
        appStatus === 'changes_requested' ||
        (appStatus === null && verStatus === 'pending') ||
        (appStatus === null && !verStatus)
      );
    });

    return NextResponse.json({
      success: true,
      applications: applications || [],
    });
  } catch (error) {
    console.error('Error in seller applications API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
