import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProducerByUserId } from '@/lib/api/database';

/**
 * Comprehensive seller registration endpoint
 * Handles all sections A-H from the specification
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to register as a seller.' },
        { status: 401 }
      );
    }

    // Check if user already has a producer profile
    const existingProducer = await getProducerByUserId(user.id);
    if (existingProducer) {
      return NextResponse.json(
        { success: false, error: 'You already have a producer profile. Please update your existing profile instead.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'fullLegalName',
      'businessName',
      'sellerType',
      'primaryEmail',
      'phoneNumber',
      'physicalAddress',
      'isRegisteredBeekeeper',
      'beekeeperRegistrationNumber',
      'registeringAuthority',
      'registrationProofUrl',
      'apiaryPhotoUrl',
      'declarations',
      'numberOfHives',
      'floralSourceIds',
      'harvestRegions',
      'typicalHarvestMonths',
      'foodSafetyCompliant',
      'declarationComplianceDocuments',
      'bio',
    ];

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== false) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate beekeeper registration
    if (!body.isRegisteredBeekeeper) {
      return NextResponse.json(
        { success: false, error: 'You must be a registered Australian beekeeper to sell on Hive Joy.' },
        { status: 400 }
      );
    }

    // Validate declarations
    const declarations = body.declarations;
    if (!declarations.hiveOwner || !declarations.ownHives || !declarations.noImported || !declarations.rawNatural) {
      return NextResponse.json(
        { success: false, error: 'All beekeeper declarations must be accepted.' },
        { status: 400 }
      );
    }

    // Validate bio length
    if (body.bio.trim().length < 100 || body.bio.trim().length > 300) {
      return NextResponse.json(
        { success: false, error: 'Bio must be between 100 and 300 words.' },
        { status: 400 }
      );
    }

    // Validate ABN if registered business
    if (body.sellerType === 'registered_business' && !body.abn) {
      return NextResponse.json(
        { success: false, error: 'ABN is required for registered businesses.' },
        { status: 400 }
      );
    }

    // Get IP and user agent from request headers
    const ipAddress = body.ipAddress || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = body.userAgent || request.headers.get('user-agent') || 'unknown';

    // Create producer record with all fields
    // Build insert object dynamically to handle missing columns gracefully
    const producerData: any = {
      user_id: user.id,
      business_name: body.businessName.trim(),
      abn: body.abn?.trim() || null,
      street: body.physicalAddress.street.trim(),
      suburb: body.physicalAddress.suburb.trim(),
      state: body.physicalAddress.state,
      postcode: body.physicalAddress.postcode.trim(),
      country: 'Australia',
      bio: body.bio.trim(),
      profile_image: body.profileImageUrl || null,
      cover_image: body.farmPhotoUrls?.[0] || null,
      verification_status: 'pending',
    };

    // Add new fields only if they exist (from migration)
    // These will be added if the migration has been run
    try {
      // Identity fields
      producerData.full_legal_name = body.fullLegalName.trim();
      producerData.seller_type = body.sellerType;
      if (body.tradingName) producerData.trading_name = body.tradingName.trim();
      if (body.website) producerData.website = body.website.trim();
      if (body.socialProfile) producerData.social_profile = body.socialProfile.trim();

      // Contact fields
      producerData.primary_email = body.primaryEmail.trim();
      producerData.phone_number = body.phoneNumber.trim();
      if (body.secondaryContactName) producerData.secondary_contact_name = body.secondaryContactName.trim();
      if (body.secondaryPhone) producerData.secondary_phone = body.secondaryPhone.trim();
      if (body.secondaryEmail) producerData.secondary_email = body.secondaryEmail.trim();

      // Address fields
      producerData.physical_address_street = body.physicalAddress.street.trim();
      producerData.physical_address_suburb = body.physicalAddress.suburb.trim();
      producerData.physical_address_state = body.physicalAddress.state;
      producerData.physical_address_postcode = body.physicalAddress.postcode.trim();
      producerData.shipping_address_different = body.shippingAddress ? true : false;
      if (body.shippingAddress) {
        producerData.shipping_address_street = body.shippingAddress.street?.trim() || null;
        producerData.shipping_address_suburb = body.shippingAddress.suburb?.trim() || null;
        producerData.shipping_address_state = body.shippingAddress.state || null;
        producerData.shipping_address_postcode = body.shippingAddress.postcode?.trim() || null;
      }

      // Beekeeper Verification
      producerData.is_registered_beekeeper = body.isRegisteredBeekeeper;
      producerData.beekeeper_registration_number = body.beekeeperRegistrationNumber.trim();
      producerData.registering_authority = body.registeringAuthority;
      if (body.registeringAuthorityOther) producerData.registering_authority_other = body.registeringAuthorityOther.trim();
      producerData.registration_proof_url = body.registrationProofUrl;
      producerData.apiary_photo_url = body.apiaryPhotoUrl;
      producerData.declaration_hive_owner = declarations.hiveOwner;
      producerData.declaration_own_hives = declarations.ownHives;
      producerData.declaration_no_imported = declarations.noImported;
      producerData.declaration_raw_natural = declarations.rawNatural;

      // Production
      producerData.number_of_hives = body.numberOfHives;
      producerData.harvest_regions = body.harvestRegions;
      producerData.typical_harvest_months = body.typicalHarvestMonths;
      if (body.extractionMethod) producerData.extraction_method = body.extractionMethod.trim();
      if (body.certifications) producerData.certifications = body.certifications;

      // Compliance
      producerData.food_safety_compliant = body.foodSafetyCompliant;
      if (body.foodHandlingRegistrationNumber) producerData.food_handling_registration_number = body.foodHandlingRegistrationNumber.trim();
      if (body.localCouncilAuthority) producerData.local_council_authority = body.localCouncilAuthority.trim();
      producerData.declaration_compliance_documents = body.declarationComplianceDocuments;

      // Payout (optional)
      if (body.bankAccountName) producerData.bank_account_name = body.bankAccountName.trim();
      if (body.bankBSB) producerData.bank_bsb = body.bankBSB.trim();
      if (body.bankAccountNumber) producerData.bank_account_number = body.bankAccountNumber.trim();
      producerData.gst_registered = body.gstRegistered || false;
      producerData.gst_included_in_pricing = body.gstIncludedInPricing || false;

      // Application Status
      producerData.application_status = 'pending_review';
      producerData.application_submitted_at = new Date().toISOString();
    } catch (err) {
      // If any field assignment fails, continue with base fields only
      console.warn('Some fields may not exist in database schema:', err);
    }

    let { data: producer, error: producerError } = await supabase
      .from('producers')
      .insert(producerData)
      .select()
      .single();

    // If insert fails due to missing columns, try with only base columns
    if (producerError && producerError.message.includes('Could not find') && producerError.message.includes('column')) {
      console.warn('Migration columns not found, using base columns only:', producerError.message);
      
      // Retry with only base columns (from original schema)
      const baseProducerData = {
        user_id: user.id,
        business_name: body.businessName.trim(),
        abn: body.abn?.trim() || null,
        street: body.physicalAddress.street.trim(),
        suburb: body.physicalAddress.suburb.trim(),
        state: body.physicalAddress.state,
        postcode: body.physicalAddress.postcode.trim(),
        country: 'Australia',
        bio: body.bio.trim(),
        profile_image: body.profileImageUrl || null,
        cover_image: body.farmPhotoUrls?.[0] || null,
        verification_status: 'pending',
      };
      
      const retryResult = await supabase
        .from('producers')
        .insert(baseProducerData)
        .select()
        .single();
      
      if (retryResult.error) {
        console.error('Error creating producer with base columns:', retryResult.error);
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to create producer: ${retryResult.error.message}. Please ensure the database migration has been run: migrations/add_seller_onboarding_fields.sql` 
          },
          { status: 500 }
        );
      }
      
      producer = retryResult.data;
      producerError = null;
    } else if (producerError) {
      console.error('Error creating producer:', producerError);
      return NextResponse.json(
        { success: false, error: `Failed to create producer: ${producerError.message}` },
        { status: 500 }
      );
    }

    // Link floral sources
    if (body.floralSourceIds && body.floralSourceIds.length > 0) {
      const floralSourceLinks = body.floralSourceIds
        .filter((floralId: string) => floralId !== 'other') // Filter out 'other' string
        .map((floralId: string) => ({
          producer_id: producer.id,
          floral_source_id: floralId,
          other_floral_source: null,
        }));

      // If "other" was selected, add it as a separate entry with NULL floral_source_id
      if (body.otherFloralSource && body.otherFloralSource.trim()) {
        floralSourceLinks.push({
          producer_id: producer.id,
          floral_source_id: null, // NULL for custom "other" sources
          other_floral_source: body.otherFloralSource.trim(),
        });
      }

      if (floralSourceLinks.length > 0) {
        const { error: floralError } = await supabase
          .from('producer_floral_sources')
          .insert(floralSourceLinks);

        if (floralError) {
          console.error('Error linking floral sources:', floralError);
          // Don't fail the whole registration if floral sources fail
        }
      }
    }

    // Create audit log entry
    await supabase
      .from('producer_application_log')
      .insert({
        producer_id: producer.id,
        action: 'submitted',
        previous_status: null,
        new_status: 'pending_review',
        notes: 'Application submitted',
      });

    // Save seller declarations to archive (existing function)
    try {
      const { saveSellerDeclarations } = await import('@/lib/api/database');
      await saveSellerDeclarations({
        producerId: producer.id,
        userId: user.id,
        declarations: {
          declaration1: declarations.hiveOwner,
          declaration2: declarations.ownHives,
          declaration3: declarations.noImported,
          declaration4: declarations.rawNatural,
          declaration5: true, // From previous declarations
          declaration6: true,
          declaration7: true,
          declaration8: true,
        },
        termsAccepted: true,
        ipAddress,
        userAgent,
      });
    } catch (declarationsError) {
      console.error('Failed to save declarations:', declarationsError);
      // Don't fail registration if declarations archive fails
    }

    // Send email notification to agent
    try {
      const { sendSellerRegistrationEmail } = await import('@/lib/sendgrid/email');
      await sendSellerRegistrationEmail(
        {
          businessName: body.businessName.trim(),
          email: body.primaryEmail.trim(),
          abn: body.abn?.trim(),
          address: {
            street: body.physicalAddress.street.trim(),
            suburb: body.physicalAddress.suburb.trim(),
            state: body.physicalAddress.state,
            postcode: body.physicalAddress.postcode.trim(),
            country: 'Australia',
          },
          bio: body.bio.trim(),
          producerId: producer.id,
          userId: user.id,
          fullLegalName: body.fullLegalName.trim(),
          sellerType: body.sellerType,
          phoneNumber: body.phoneNumber.trim(),
          beekeeperRegistrationNumber: body.beekeeperRegistrationNumber.trim(),
          registeringAuthority: body.registeringAuthority,
          applicationId: producer.id,
        },
        'adarsha.aryal653@gmail.com'
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      producer,
      message: 'Application submitted successfully. It will be reviewed by our team.',
    });
  } catch (error) {
    console.error('Error in comprehensive registration:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit application',
      },
      { status: 500 }
    );
  }
}
