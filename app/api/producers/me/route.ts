import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProducerByUserId } from '@/lib/api/database';

/**
 * Get the current user's producer profile
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the most recent producer for this user (same fix as batches)
    const { data: producersData, error: producersError } = await supabase
      .from('producers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (producersError || !producersData) {
      return NextResponse.json(
        { success: false, error: 'Producer profile not found' },
        { status: 404 }
      );
    }

    // Map to ProducerProfile format
    const producer = {
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

    return NextResponse.json({ success: true, producer });
  } catch (error) {
    console.error('Error fetching producer:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
