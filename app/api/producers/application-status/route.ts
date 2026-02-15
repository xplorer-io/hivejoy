import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get the current user's application status and admin notes
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

    // Get the most recent producer for this user
    const { data: producersData, error: producersError } = await supabase
      .from('producers')
      .select('id, application_status, changes_requested_fields')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (producersError || !producersData) {
      return NextResponse.json(
        { success: false, error: 'Producer profile not found' },
        { status: 404 }
      );
    }

    const producerId = producersData.id;

    // Get the most recent application log entry with notes
    const { data: applicationLog, error: logError } = await supabase
      .from('producer_application_log')
      .select('action, notes, changed_fields, created_at')
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      applicationStatus: (producersData as { application_status?: string })?.application_status || null,
      changesRequestedFields: (producersData as { changes_requested_fields?: string[] })?.changes_requested_fields || null,
      latestNote: (applicationLog as { notes?: string })?.notes || null,
      latestAction: (applicationLog as { action?: string })?.action || null,
      latestChangedFields: (applicationLog as { changed_fields?: string[] })?.changed_fields || null,
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
