import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get the current user's full application details
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
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (producersError || !producersData) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const producerId = producersData.id;

    // Get floral sources
    const { data: floralSources } = await supabase
      .from('producer_floral_sources')
      .select(`
        *,
        floral_sources:floral_source_id (
          id,
          name
        )
      `)
      .eq('producer_id', producerId);

    // Get application log
    const { data: applicationLog } = await supabase
      .from('producer_application_log')
      .select('*')
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      application: {
        producer: producersData,
        floralSources: floralSources || [],
        applicationLog: applicationLog || [],
      },
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
