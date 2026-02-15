import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Update an existing seller application
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to update your application.' },
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
      .select('user_id, application_status')
      .eq('id', producerId)
      .single();

    if (checkError || !existingProducer) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    if ((existingProducer as { user_id: string }).user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. This application does not belong to you.' },
        { status: 403 }
      );
    }

    // Only allow updates if status is pending_review or changes_requested
    const currentStatus = (existingProducer as { application_status?: string })?.application_status;
    if (currentStatus !== 'pending_review' && currentStatus !== 'changes_requested') {
      return NextResponse.json(
        { success: false, error: 'Application cannot be updated in its current status.' },
        { status: 400 }
      );
    }

    // Build update object
    const updateFields: Record<string, any> = {};

    // Identity fields
    if (updateData.fullLegalName !== undefined) updateFields.full_legal_name = updateData.fullLegalName?.trim() || null;
    if (updateData.businessName !== undefined) updateFields.business_name = updateData.businessName?.trim() || null;
    if (updateData.sellerType !== undefined) updateFields.seller_type = updateData.sellerType || null;
    if (updateData.abn !== undefined) updateFields.abn = updateData.abn?.trim() || null;
    if (updateData.tradingName !== undefined) updateFields.trading_name = updateData.tradingName?.trim() || null;
    if (updateData.website !== undefined) updateFields.website = updateData.website?.trim() || null;
    if (updateData.socialProfile !== undefined) updateFields.social_profile = updateData.socialProfile?.trim() || null;

    // Contact fields
    if (updateData.primaryEmail !== undefined) updateFields.primary_email = updateData.primaryEmail?.trim() || null;
    if (updateData.phoneNumber !== undefined) updateFields.phone_number = updateData.phoneNumber?.trim() || null;
    if (updateData.secondaryContactName !== undefined) updateFields.secondary_contact_name = updateData.secondaryContactName?.trim() || null;
    if (updateData.secondaryPhone !== undefined) updateFields.secondary_phone = updateData.secondaryPhone?.trim() || null;
    if (updateData.secondaryEmail !== undefined) updateFields.secondary_email = updateData.secondaryEmail?.trim() || null;

    // Address fields
    if (updateData.physicalAddress) {
      updateFields.physical_address_street = updateData.physicalAddress.street.trim();
      updateFields.physical_address_suburb = updateData.physicalAddress.suburb.trim();
      updateFields.physical_address_state = updateData.physicalAddress.state;
      updateFields.physical_address_postcode = updateData.physicalAddress.postcode.trim();
      // Also update legacy fields
      updateFields.street = updateData.physicalAddress.street.trim();
      updateFields.suburb = updateData.physicalAddress.suburb.trim();
      updateFields.state = updateData.physicalAddress.state;
      updateFields.postcode = updateData.physicalAddress.postcode.trim();
    }
    if (updateData.shippingAddress !== undefined) {
      updateFields.shipping_address_different = !!updateData.shippingAddress;
      if (updateData.shippingAddress) {
        updateFields.shipping_address_street = updateData.shippingAddress.street?.trim() || null;
        updateFields.shipping_address_suburb = updateData.shippingAddress.suburb?.trim() || null;
        updateFields.shipping_address_state = updateData.shippingAddress.state || null;
        updateFields.shipping_address_postcode = updateData.shippingAddress.postcode?.trim() || null;
      }
    }

    // Beekeeper Verification
    if (updateData.isRegisteredBeekeeper !== undefined) updateFields.is_registered_beekeeper = updateData.isRegisteredBeekeeper;
    if (updateData.beekeeperRegistrationNumber) updateFields.beekeeper_registration_number = updateData.beekeeperRegistrationNumber.trim();
    if (updateData.registeringAuthority) updateFields.registering_authority = updateData.registeringAuthority;
    if (updateData.registeringAuthorityOther !== undefined) updateFields.registering_authority_other = updateData.registeringAuthorityOther?.trim() || null;
    if (updateData.registrationProofUrl) updateFields.registration_proof_url = updateData.registrationProofUrl;
    if (updateData.apiaryPhotoUrl) updateFields.apiary_photo_url = updateData.apiaryPhotoUrl;
    if (updateData.declarations) {
      updateFields.declaration_hive_owner = updateData.declarations.hiveOwner;
      updateFields.declaration_own_hives = updateData.declarations.ownHives;
      updateFields.declaration_no_imported = updateData.declarations.noImported;
      updateFields.declaration_raw_natural = updateData.declarations.rawNatural;
    }

    // Production
    if (updateData.numberOfHives) updateFields.number_of_hives = parseInt(updateData.numberOfHives, 10);
    if (updateData.harvestRegions) updateFields.harvest_regions = updateData.harvestRegions;
    if (updateData.typicalHarvestMonths) updateFields.typical_harvest_months = updateData.typicalHarvestMonths;
    if (updateData.extractionMethod !== undefined) updateFields.extraction_method = updateData.extractionMethod?.trim() || null;
    if (updateData.certifications !== undefined) updateFields.certifications = updateData.certifications || null;

    // Compliance
    if (updateData.foodSafetyCompliant !== undefined) updateFields.food_safety_compliant = updateData.foodSafetyCompliant;
    if (updateData.foodHandlingRegistrationNumber !== undefined) updateFields.food_handling_registration_number = updateData.foodHandlingRegistrationNumber?.trim() || null;
    if (updateData.localCouncilAuthority !== undefined) updateFields.local_council_authority = updateData.localCouncilAuthority?.trim() || null;
    if (updateData.declarationComplianceDocuments !== undefined) updateFields.declaration_compliance_documents = updateData.declarationComplianceDocuments;

    // Profile
    if (updateData.bio !== undefined) updateFields.bio = updateData.bio?.trim() || null;
    if (updateData.profileImageUrl) updateFields.profile_image = updateData.profileImageUrl;
    if (updateData.farmPhotoUrls && updateData.farmPhotoUrls.length > 0) {
      updateFields.cover_image = updateData.farmPhotoUrls[0];
    }

    // If changes were requested, reset status to pending_review after update
    if (currentStatus === 'changes_requested') {
      updateFields.application_status = 'pending_review';
      updateFields.changes_requested_fields = null;
    }

    updateFields.updated_at = new Date().toISOString();

    // Update producer
    const { data: updatedProducer, error: updateError } = await supabase
      .from('producers')
      .update(updateFields)
      .eq('id', producerId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating producer:', updateError);
      return NextResponse.json(
        { success: false, error: `Failed to update application: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Update floral sources
    if (updateData.floralSourceIds || updateData.otherFloralSource) {
      // Delete existing floral source links
      await supabase
        .from('producer_floral_sources')
        .delete()
        .eq('producer_id', producerId);

      // Insert new floral source links
      if (updateData.floralSourceIds && updateData.floralSourceIds.length > 0) {
        const floralSourceLinks = updateData.floralSourceIds
          .filter((floralId: string) => floralId !== 'other')
          .map((floralId: string) => ({
            producer_id: producerId,
            floral_source_id: floralId,
            other_floral_source: null,
          }));

        // If "other" was selected, add it
        if (updateData.otherFloralSource && updateData.otherFloralSource.trim()) {
          floralSourceLinks.push({
            producer_id: producerId,
            floral_source_id: null,
            other_floral_source: updateData.otherFloralSource.trim(),
          });
        }

        if (floralSourceLinks.length > 0) {
          await supabase
            .from('producer_floral_sources')
            .insert(floralSourceLinks);
        }
      }
    }

    // Create audit log entry
    await supabase
      .from('producer_application_log')
      .insert({
        producer_id: producerId,
        action: currentStatus === 'changes_requested' ? 'resubmitted' : 'updated',
        previous_status: currentStatus,
        new_status: currentStatus === 'changes_requested' ? 'pending_review' : currentStatus,
        notes: 'Application updated by seller',
      });

    return NextResponse.json({
      success: true,
      producer: updatedProducer,
      message: currentStatus === 'changes_requested' 
        ? 'Application updated and resubmitted for review.'
        : 'Application updated successfully.',
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update application',
      },
      { status: 500 }
    );
  }
}
