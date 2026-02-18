import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Update producer profile information
 * This is for updating profile details after approval, not for application updates
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to update your profile.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { producerId, ...updateData } = body;

    if (!producerId) {
      return NextResponse.json(
        { success: false, error: 'Producer ID is required' },
        { status: 400 }
      );
    }

    // Verify the producer belongs to this user
    const { data: existingProducer, error: checkError } = await supabase
      .from('producers')
      .select('user_id')
      .eq('id', producerId)
      .single();

    if (checkError || !existingProducer) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    if ((existingProducer as { user_id: string }).user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. This profile does not belong to you.' },
        { status: 403 }
      );
    }

    // Build update object
    const updateFields: Record<string, string | null | undefined> = {};

    // Profile fields that can be updated
    if (updateData.businessName !== undefined) updateFields.business_name = updateData.businessName?.trim() || null;
    if (updateData.bio !== undefined) updateFields.bio = updateData.bio?.trim() || null;
    if (updateData.profileImage !== undefined) updateFields.profile_image = updateData.profileImage || null;
    if (updateData.coverImage !== undefined) updateFields.cover_image = updateData.coverImage || null;
    if (updateData.phoneNumber !== undefined) updateFields.phone_number = updateData.phoneNumber?.trim() || null;
    if (updateData.primaryEmail !== undefined) updateFields.primary_email = updateData.primaryEmail?.trim() || null;
    if (updateData.website !== undefined) updateFields.website = updateData.website?.trim() || null;
    if (updateData.socialProfile !== undefined) updateFields.social_profile = updateData.socialProfile?.trim() || null;
    if (updateData.tradingName !== undefined) updateFields.trading_name = updateData.tradingName?.trim() || null;
    if (updateData.secondaryContactName !== undefined) updateFields.secondary_contact_name = updateData.secondaryContactName?.trim() || null;
    if (updateData.secondaryPhone !== undefined) updateFields.secondary_phone = updateData.secondaryPhone?.trim() || null;
    if (updateData.secondaryEmail !== undefined) updateFields.secondary_email = updateData.secondaryEmail?.trim() || null;

    // Address fields (use '' for empty so NOT NULL columns are satisfied)
    if (updateData.street !== undefined) updateFields.street = updateData.street?.trim() || '';
    if (updateData.suburb !== undefined) updateFields.suburb = updateData.suburb?.trim() || '';
    if (updateData.state !== undefined) updateFields.state = updateData.state?.trim() || '';
    if (updateData.postcode !== undefined) updateFields.postcode = updateData.postcode?.trim() || '';

    // Update the producer record
    const { data: updatedProducer, error: updateError } = await supabase
      .from('producers')
      .update(updateFields)
      .eq('id', producerId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating producer:', updateError);
      return NextResponse.json(
        { success: false, error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      producer: updatedProducer,
    });
  } catch (error) {
    console.error('Error updating producer profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
