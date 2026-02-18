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

    const { id } = await params;

    // Fetch producer with all details
    const { data: producer, error: producerError } = await supabase
      .from('producers')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          role,
          status
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

    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be approve or reject' },
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

    const previousStatus = (currentProducer as { application_status?: string })?.application_status || null;
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
    } else {
      // reject
      newStatus = 'rejected';
      updateData = {
        application_status: 'rejected',
        application_rejected_at: new Date().toISOString(),
        rejected_by: user.id,
        rejection_reason: notes || 'Application rejected by admin',
        verification_status: 'rejected',
      };
    }

    // Get producer user_id before updating
    const { data: producerForUserId } = await supabase
      .from('producers')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!producerForUserId) {
      return NextResponse.json(
        { success: false, error: 'Producer not found' },
        { status: 404 }
      );
    }

    const userId = (producerForUserId as { user_id: string }).user_id;

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

    // When approved: set seller's profile role to 'producer' so they can access the seller dashboard (automatic)
    let roleUpdated = false;
    if (action === 'approve') {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const adminClient = createAdminClient();

      if (!adminClient) {
        console.error(
          'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local so approved sellers get role=producer automatically.'
        );
      } else {
        const { error: roleUpdateError } = await adminClient
          .from('profiles')
          .update({ role: 'producer', updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (roleUpdateError) {
          console.error('Error updating user role to producer:', roleUpdateError);
        } else {
          roleUpdated = true;
        }
      }
    }

    // Create audit log entry
    await supabase
      .from('producer_application_log')
      .insert({
        producer_id: id,
        admin_id: user.id,
        action: action === 'approve' ? 'approved' : 'rejected',
        previous_status: previousStatus,
        new_status: newStatus,
        notes: notes || undefined,
        changed_fields: body.fields || undefined,
      });

    // Send email notification to seller
    try {
      const { data: producerData } = await supabase
        .from('producers')
        .select('user_id, business_name, primary_email')
        .eq('id', id)
        .single();

      if (producerData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', (producerData as { user_id: string }).user_id)
          .single();

        const sellerEmail = (producerData as { primary_email?: string }).primary_email || 
                           (profileData as { email?: string })?.email;

        console.log('Attempting to send email notification:', {
          action,
          sellerEmail,
          businessName: (producerData as { business_name: string }).business_name,
          hasNotes: !!notes,
        });

        if (sellerEmail) {
          const { sendApplicationStatusUpdateEmail } = await import('@/lib/sendgrid/email');
          // Convert action to email format: 'approve' -> 'approved', 'reject' -> 'rejected'
          const emailAction: 'approved' | 'rejected' = action === 'approve' ? 'approved' : 'rejected';
          console.log('Sending email with action:', emailAction, 'Original action:', action);
          const emailResult = await sendApplicationStatusUpdateEmail({
            businessName: (producerData as { business_name: string }).business_name,
            email: sellerEmail,
            action: emailAction,
            notes: notes || undefined,
            changedFields: body.fields || undefined,
            applicationId: id,
          });
          
          if (emailResult.success) {
            console.log('Email notification sent successfully to:', sellerEmail);
          } else {
            console.error('Failed to send email notification:', emailResult.error);
          }
        } else {
          console.warn('No seller email found. Producer data:', producerData, 'Profile data:', profileData);
        }
      } else {
        console.warn('Producer data not found for application ID:', id);
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      application: updatedProducer,
      message: `Application ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked for changes'} successfully`,
      ...(action === 'approve' && !roleUpdated && {
        warning: 'Seller role was not updated. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the app so future approvals set role automatically.',
      }),
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
