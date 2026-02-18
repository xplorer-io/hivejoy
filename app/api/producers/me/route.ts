import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Get the current user's producer profile.
 * For admins with no producer yet: create a minimal approved producer so they can edit their profile without going through seller verification.
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

    let producersData: Record<string, unknown> | null = null;
    let producersError: { message: string } | null = null;

    const { data, error } = await supabase
      .from('producers')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    producersData = data as Record<string, unknown> | null;
    producersError = error as { message: string } | null;

    // If no producer and user is admin, create a minimal producer so they can use the Profile page without seller verification
    if ((producersError || !producersData) && user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = (profile as { role?: string } | null)?.role;
      if (role === 'admin') {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const adminClient = createAdminClient();
        if (adminClient) {
          const businessName = (user.email && user.email.split('@')[0]) ? `${(user.email as string).split('@')[0]} (Producer)` : 'My Producer Profile';
          const { data: newProducer, error: insertError } = await adminClient
            .from('producers')
            .insert({
              user_id: user.id,
              business_name: businessName,
              street: '',
              suburb: '',
              state: '',
              postcode: '',
              country: 'Australia',
              bio: '',
              verification_status: 'approved',
              application_status: 'approved',
              badge_level: 'verified',
            })
            .select(`
              *,
              profiles:user_id (
                id,
                email,
                status
              )
            `)
            .single();

          if (!insertError && newProducer) {
            producersData = newProducer as Record<string, unknown>;
            producersError = null;
          }
        }
      }
    }

    if (producersError || !producersData) {
      return NextResponse.json(
        { success: false, error: 'Producer profile not found' },
        { status: 404 }
      );
    }

    // Map to ProducerProfile format
    const profileStatus = (producersData as { profiles?: { status?: string; email?: string } })?.profiles?.status || 'active';
    const profileEmail = (producersData as { profiles?: { email?: string } })?.profiles?.email;
    const producer = {
      id: producersData.id,
      userId: producersData.user_id,
      businessName: producersData.business_name,
      abn: producersData.abn || undefined,
      fullLegalName: (producersData as { full_legal_name?: string })?.full_legal_name || undefined,
      sellerType: (producersData as { seller_type?: string })?.seller_type || undefined,
      tradingName: (producersData as { trading_name?: string })?.trading_name || undefined,
      website: (producersData as { website?: string })?.website || undefined,
      socialProfile: (producersData as { social_profile?: string })?.social_profile || undefined,
      primaryEmail: (producersData as { primary_email?: string })?.primary_email || profileEmail || user.email || undefined,
      phoneNumber: (producersData as { phone_number?: string })?.phone_number || undefined,
      secondaryContactName: (producersData as { secondary_contact_name?: string })?.secondary_contact_name || undefined,
      secondaryPhone: (producersData as { secondary_phone?: string })?.secondary_phone || undefined,
      secondaryEmail: (producersData as { secondary_email?: string })?.secondary_email || undefined,
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
      applicationStatus: (producersData as { application_status?: string })?.application_status || undefined,
      badgeLevel: producersData.badge_level as 'none' | 'verified' | 'premium',
      createdAt: producersData.created_at,
      updatedAt: producersData.updated_at,
      profileStatus: profileStatus as 'active' | 'suspended' | 'banned',
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
