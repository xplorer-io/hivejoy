import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Validate environment variables first
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary is not configured' },
        { status: 500 }
      );
    }

    // Configure Cloudinary at request time
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'publicId is required' },
        { status: 400 }
      );
    }

    // Verify ownership: Check if the image belongs to the user's resources
    // Extract publicId from URL if full URL is provided
    const publicIdToCheck = publicId.includes('res.cloudinary.com') 
      ? publicId.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '') // Extract path and remove extension
      : publicId;

    // Check producer profile images
    const producerResult = await supabase
      .from('producers')
      .select('id')
      .eq('user_id', user.id)
      .or(`profile_image.ilike.%${publicIdToCheck}%,cover_image.ilike.%${publicIdToCheck}%`)
      .maybeSingle();

    const producer = producerResult.data as { id: string } | null;

    // Check product photos if user has a producer profile
    let hasOwnership = !!producer?.id;

    if (producer?.id) {
      // Select photos array and check membership in memory
      const { data: products } = await supabase
        .from('products')
        .select('photos')
        .eq('producer_id', producer.id)
        .limit(100); // Limit to reasonable number for memory check

      if (Array.isArray(products)) {
        for (const product of products) {
          const photos = Array.isArray(product.photos) ? product.photos : [];
          // Check if any photo URL contains the publicIdToCheck
          if (photos.some((photo: string) => photo.includes(publicIdToCheck))) {
            hasOwnership = true;
            break;
          }
        }
      }
    }

    // Check verification documents
    if (!hasOwnership) {
      const verificationDocsResult = await supabase
        .from('verification_documents')
        .select('submission_id')
        .ilike('url', `%${publicIdToCheck}%`)
        .limit(1);

      const verificationDocs = Array.isArray(verificationDocsResult.data) ? verificationDocsResult.data : [];

      if (verificationDocs.length > 0) {
        const submissionResult = await supabase
          .from('verification_submissions')
          .select('producer_id')
          .eq('id', verificationDocs[0].submission_id)
          .maybeSingle();

        const submission = submissionResult.data as { producer_id: string } | null;

        if (submission?.producer_id) {
          const ownerProducerResult = await supabase
            .from('producers')
            .select('user_id')
            .eq('id', submission.producer_id)
            .eq('user_id', user.id)
            .maybeSingle();

          const ownerProducer = ownerProducerResult.data as { user_id: string } | null;
          hasOwnership = !!ownerProducer;
        }
      }
    }

    if (!hasOwnership) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this image' },
        { status: 403 }
      );
    }

    // Use normalized publicIdToCheck for Cloudinary destroy call
    const result = await cloudinary.uploader.destroy(publicIdToCheck);

    if (result.result === 'ok') {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
