import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBatch, getProducerByUserId } from '@/lib/api/database';

/**
 * API route to create a new batch
 */
export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    // Get producer profile for this user, or create a minimal one if it doesn't exist
    let producer = await getProducerByUserId(user.id);

    if (!producer) {
      // Auto-create a minimal producer profile for verified sellers (temporary for development)
            const { data: profile } = await supabase
              .from('users')
              .select('email')
              .eq('id', user.id)
              .single();

            const { data: newProducer, error: createError } = await supabase
              .from('producers')
              .insert({
                user_id: user.id,
                business_name: (profile as { email?: string })?.email?.split('@')[0] || 'Seller',
          street: 'TBD',
          suburb: 'TBD',
          state: 'TBD',
          postcode: '0000',
          country: 'Australia',
          bio: 'Verified seller',
          verification_status: 'approved', // Auto-approved for development
        })
        .select()
        .single();

      if (createError || !newProducer) {
        console.error('[POST /api/batches/create] Failed to create producer profile:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create producer profile: ' + (createError?.message || 'Unknown error') },
          { status: 500 }
        );
      }
      
      console.log('[POST /api/batches/create] Auto-created producer profile:', newProducer.id);

      producer = {
        id: newProducer.id,
        userId: newProducer.user_id,
        businessName: newProducer.business_name,
        abn: newProducer.abn || undefined,
        address: {
          street: newProducer.street,
          suburb: newProducer.suburb,
          state: newProducer.state,
          postcode: newProducer.postcode,
          country: newProducer.country,
        },
        bio: newProducer.bio || undefined,
        profileImage: newProducer.profile_image || undefined,
        coverImage: newProducer.cover_image || undefined,
        verificationStatus: newProducer.verification_status as 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected',
        badgeLevel: newProducer.badge_level as 'none' | 'verified' | 'premium',
        createdAt: newProducer.created_at,
        updatedAt: newProducer.updated_at,
      };
    }

    // Parse request body
    const body = await request.json();
    const { region, harvestDate, extractionDate, floralSourceTags, notes } = body;

    // Validate required fields
    if (!region || !harvestDate || !extractionDate || !floralSourceTags) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: region, harvestDate, extractionDate, and floralSourceTags are required.' },
        { status: 400 }
      );
    }

    // Validate floralSourceTags is an array
    if (!Array.isArray(floralSourceTags) || floralSourceTags.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one floral source is required.' },
        { status: 400 }
      );
    }

    console.log('[POST /api/batches/create] Creating batch for producer:', producer.id);
    console.log('[POST /api/batches/create] Producer details:', {
      id: producer.id,
      userId: producer.userId,
      businessName: producer.businessName,
    });
    console.log('[POST /api/batches/create] Batch data:', {
      producerId: producer.id,
      region: region.trim(),
      harvestDate,
      extractionDate,
      floralSourceTags,
    });

    // Create batch
    const batch = await createBatch({
      producerId: producer.id,
      region: region.trim(),
      harvestDate,
      extractionDate,
      floralSourceTags,
      notes: notes?.trim() || undefined,
    });

    console.log('[POST /api/batches/create] Batch created successfully:', batch.id);
    console.log('[POST /api/batches/create] Batch details:', {
      id: batch.id,
      producerId: batch.producerId,
      region: batch.region,
      status: batch.status,
    });
    
    // Verify the batch was saved by querying it back
    const { data: verifyBatch, error: verifyError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', batch.id)
      .single();
    
    if (verifyError) {
      console.error('[POST /api/batches/create] ERROR: Batch not found after creation!', verifyError);
    } else {
      console.log('[POST /api/batches/create] Verified batch in database:', verifyBatch?.id);
      console.log('[POST /api/batches/create] Batch producer_id:', verifyBatch?.producer_id);
    }

    return NextResponse.json({
      success: true,
      batch,
      message: 'Batch created successfully.',
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create batch',
      },
      { status: 500 }
    );
  }
}
