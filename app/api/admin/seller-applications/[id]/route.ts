import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/seller-applications/[id]
 * Get a single seller application with all details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Fetch producer with all details
    const { data: producer, error: producerError } = await supabase
      .from('producers')
      .select(`
        *,
        users:user_id (
          id,
          email,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (producerError || !producer) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Fetch floral sources
    const { data: floralSources } = await supabase
      .from('producer_floral_sources')
      .select(`
        *,
        floral_sources:floral_source_id (
          id,
          name
        )
      `)
      .eq('producer_id', id);

    // Fetch application log
    const { data: applicationLog } = await supabase
      .from('producer_application_log')
      .select('*')
      .eq('producer_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      application: {
        producer,
        floralSources: floralSources || [],
        applicationLog: applicationLog || [],
      },
    });
  } catch (error) {
    console.error('Error fetching seller application:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/seller-applications/[id]
 * Approve or reject a seller application
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body; // action: 'approve' | 'reject' | 'request_changes'

    if (!action || !['approve', 'reject', 'request_changes'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be approve, reject, or request_changes' },
        { status: 400 }
      );
    }

    // Get current application status
    const { data: currentProducer } = await supabase
      .from('producers')
      .select('application_status')
      .eq('id', id)
      .single();

    if (!currentProducer) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const previousStatus = (currentProducer as { application_status?: string }).application_status;
    let newStatus: string;
    let updateData: Record<string, string | boolean | string[] | null | undefined> = {};

    if (action === 'approve') {
      newStatus = 'approved';
      updateData = {
        application_status: 'approved',
        application_approved_at: new Date().toISOString(),
        approved_by: user.id,
        verification_status: 'approved',
      };
    } else if (action === 'reject') {
      newStatus = 'rejected';
      updateData = {
        application_status: 'rejected',
        application_rejected_at: new Date().toISOString(),
        rejected_by: user.id,
        rejection_reason: notes || 'Application rejected by admin',
        verification_status: 'rejected',
      };
    } else {
      // request_changes
      newStatus = 'changes_requested';
      updateData = {
        application_status: 'changes_requested',
        changes_requested_fields: body.fields || [],
      };
    }

    // Update producer
    const { data: updatedProducer, error: updateError } = await supabase
      .from('producers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update application' },
        { status: 500 }
      );
    }

    // Create audit log entry
    await supabase
      .from('producer_application_log')
      .insert({
        producer_id: id,
        admin_id: user.id,
        action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'changes_requested',
        previous_status: previousStatus,
        new_status: newStatus,
        notes: notes || undefined,
        changed_fields: body.fields || undefined,
      });

    // If approved, update user role to producer
    if (action === 'approve') {
      const { data: producerData } = await supabase
        .from('producers')
        .select('user_id')
        .eq('id', id)
        .single();

      if (producerData && (producerData as { user_id?: string }).user_id) {
        await supabase
          .from('users')
          .update({ role: 'producer' })
          .eq('id', (producerData as { user_id: string }).user_id);
      }
    }

    return NextResponse.json({
      success: true,
      application: updatedProducer,
      message: `Application ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked for changes'} successfully`,
    });
  } catch (error) {
    console.error('Error updating seller application:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
