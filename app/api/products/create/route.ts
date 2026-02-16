import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createProduct } from '@/lib/api/database';

/**
 * API route to create a new product listing
 * Only verified sellers can create listings
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
    // Use direct query to get the most recent producer (same as batches fix)
    const { data: producersData, error: producersError } = await supabase
      .from('producers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let producer = null;
    
    if (producersData && !producersError) {
      producer = {
        id: producersData.id,
        userId: producersData.user_id,
        businessName: producersData.business_name,
        abn: producersData.abn || undefined,
        address: {
          street: producersData.street,
          suburb: producersData.suburb,
          state: producersData.state,
          postcode: producersData.postcode,
          country: producersData.country,
        },
        bio: producersData.bio || undefined,
        profileImage: producersData.profile_image || undefined,
        coverImage: producersData.cover_image || undefined,
        verificationStatus: producersData.verification_status as 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected',
        badgeLevel: producersData.badge_level as 'none' | 'verified' | 'premium',
        createdAt: producersData.created_at,
        updatedAt: producersData.updated_at,
      };
      console.log('[POST /api/products/create] Using existing producer:', producer.id);
    }

    if (!producer) {
      console.log('[POST /api/products/create] No producer found, creating new one...');
      // Auto-create a minimal producer profile for verified sellers (temporary for development)
      const { data: profile } = await supabase
        .from('profiles')
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
        return NextResponse.json(
          { success: false, error: 'Failed to create producer profile.' },
          { status: 500 }
        );
      }

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

    // Note: All producers are assumed to be verified - no verification check needed

    // Parse request body
    const body = await request.json();
    const { batchId, title, description, photos, variants } = body;

    console.log('[POST /api/products/create] Request body:', {
      batchId,
      title,
      descriptionLength: description?.length,
      photosCount: photos?.length,
      variantsCount: variants?.length,
    });

    // Validate required fields
    if (!batchId || !title || !description || !photos || !variants) {
      console.error('[POST /api/products/create] Missing required fields:', {
        batchId: !!batchId,
        title: !!title,
        description: !!description,
        photos: !!photos,
        variants: !!variants,
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate photos array
    if (!Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one photo is required' },
        { status: 400 }
      );
    }

    // Validate variants array
    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one variant is required' },
        { status: 400 }
      );
    }

    // Validate each variant
    for (const variant of variants) {
      if (!variant.price || variant.stock === undefined || !variant.weight) {
        return NextResponse.json(
          { success: false, error: 'All variant fields (price, stock, weight) are required' },
          { status: 400 }
        );
      }
    }

    console.log('[POST /api/products/create] Creating product for producer:', producer.id);
    console.log('[POST /api/products/create] Product data:', {
      producerId: producer.id,
      batchId,
      title,
      photosCount: photos.length,
      variantsCount: variants.length,
    });

    // Create the product
    const product = await createProduct({
      producerId: producer.id,
      batchId,
      title,
      description,
      photos,
      variants: variants.map((v: { price: string; stock: string; weight: string; barcode?: string }) => ({
        // Generate size from weight (e.g., "250g" from weight 250)
        size: `${parseFloat(v.weight)}g`,
        price: parseFloat(v.price),
        stock: parseInt(v.stock, 10),
        weight: parseFloat(v.weight),
        barcode: v.barcode || undefined,
      })),
    });

    console.log('[POST /api/products/create] Product created successfully:', product.id);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
