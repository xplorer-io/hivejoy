import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/admin/sellers/[id]
 * Suspend, ban, or reactivate a seller
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
    const { action, reason } = body; // action: 'suspend' | 'ban' | 'reactivate'

    if (!action || !['suspend', 'ban', 'reactivate'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be suspend, ban, or reactivate' },
        { status: 400 }
      );
    }

    // Get the producer to find the user_id
    const { data: producer, error: producerError } = await supabase
      .from('producers')
      .select('user_id')
      .eq('id', id)
      .single();

    if (producerError || !producer) {
      return NextResponse.json(
        { success: false, error: 'Seller not found' },
        { status: 404 }
      );
    }

    const userId = (producer as { user_id: string }).user_id;
    let newStatus: 'active' | 'suspended' | 'banned';

    if (action === 'suspend') {
      newStatus = 'suspended';
    } else if (action === 'ban') {
      newStatus = 'banned';
    } else {
      newStatus = 'active';
    }

    // Update user profile status
    const { data: updatedProfile, error: updateError } = await supabase
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

    // If suspending or banning, also update verification status
    if (action === 'suspend' || action === 'ban') {
      await supabase
        .from('producers')
        .update({
          verification_status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
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
