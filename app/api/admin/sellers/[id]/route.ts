import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendSellerStatusChangeEmail } from '@/lib/sendgrid/email';

/**
 * PATCH /api/admin/sellers/[id]
 * - Suspend / Ban: update profile status and producer verification_status; send email.
 * - Remove: permanently delete producer and all related data (products, batches, etc. via CASCADE),
 *   set profile to consumer + active, send email. Seller disappears from list.
 * Uses admin client for updates/deletes so RLS does not block.
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

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error. SUPABASE_SERVICE_ROLE_KEY is required to update seller status.' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    if (!action || !['suspend', 'ban', 'remove', 'reactivate'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be suspend, ban, remove, or reactivate' },
        { status: 400 }
      );
    }

    const needsReason = action === 'suspend' || action === 'ban' || action === 'remove';
    const reasonTrimmed = typeof reason === 'string' ? reason.trim() : '';
    if (needsReason && !reasonTrimmed) {
      return NextResponse.json(
        { success: false, error: 'A reason is required for suspend, ban, and remove' },
        { status: 400 }
      );
    }

    const { data: producer, error: producerError } = await supabase
      .from('producers')
      .select('user_id, business_name')
      .eq('id', id)
      .single();

    if (producerError || !producer) {
      return NextResponse.json(
        { success: false, error: 'Seller not found' },
        { status: 404 }
      );
    }

    const userId = (producer as { user_id: string; business_name?: string }).user_id;
    const businessName = (producer as { user_id: string; business_name?: string }).business_name || 'Seller';

    if (action === 'suspend' || action === 'ban' || action === 'remove') {
      const { data: targetProfile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if ((targetProfile as { role?: string } | null)?.role === 'admin') {
        return NextResponse.json(
          { success: false, error: 'Admins cannot be suspended, banned, or removed.' },
          { status: 403 }
        );
      }
    }

    // --- REMOVE: delete all seller data and revert user to consumer ---
    if (action === 'remove') {
      const { data: sellerProfile } = await adminClient
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
      const sellerEmail = (sellerProfile as { email?: string } | null)?.email;

      const { error: deleteError } = await adminClient
        .from('producers')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting producer (remove seller):', deleteError);
        return NextResponse.json(
          { success: false, error: 'Failed to remove seller and their data' },
          { status: 500 }
        );
      }

      const { error: profileUpdateError } = await adminClient
        .from('profiles')
        .update({
          role: 'consumer',
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileUpdateError) {
        console.error('Error reverting profile after remove:', profileUpdateError);
        return NextResponse.json(
          { success: false, error: 'Seller data was deleted but profile update failed. Please contact support.' },
          { status: 500 }
        );
      }

      if (sellerEmail) {
        await sendSellerStatusChangeEmail({
          businessName,
          email: sellerEmail,
          action: 'remove',
          reason: reasonTrimmed,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Seller removed successfully. All seller data (products, batches, etc.) has been deleted.',
      });
    }

    // --- SUSPEND / BAN / REACTIVATE: update profile status only ---
    let newStatus: 'active' | 'suspended' | 'banned';
    if (action === 'suspend') newStatus = 'suspended';
    else if (action === 'ban') newStatus = 'banned';
    else newStatus = 'active';

    const { data: updatedProfile, error: updateError } = await adminClient
      .from('profiles')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile status:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update seller status' },
        { status: 500 }
      );
    }

    if (action === 'suspend' || action === 'ban') {
      await adminClient
        .from('producers')
        .update({
          verification_status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      const { data: sellerProfile } = await adminClient
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();
      const sellerEmail = (sellerProfile as { email?: string } | null)?.email;
      if (sellerEmail) {
        await sendSellerStatusChangeEmail({
          businessName,
          email: sellerEmail,
          action: action as 'suspend' | 'ban',
          reason: reasonTrimmed,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seller ${action === 'suspend' ? 'suspended' : action === 'ban' ? 'banned' : 'reactivated'} successfully`,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating seller status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
