import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createProducer, getProducerByUserId } from '@/lib/api/database';
import type { Address } from '@/types';

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
    const {
      businessName,
      abn,
      address,
      bio,
      declarations,
      termsAccepted,
      ipAddress,
      userAgent,
    } = body;

    // Validate required fields
    if (!businessName || !address || !bio) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: businessName, address, and bio are required.' },
        { status: 400 }
      );
    }

    // Validate address structure
    const addressFields: (keyof Address)[] = ['street', 'suburb', 'state', 'postcode'];
    for (const field of addressFields) {
      if (!address[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required address field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate declarations - all 8 must be true
    if (!declarations || typeof declarations !== 'object') {
      return NextResponse.json(
        { success: false, error: 'All seller declarations must be accepted.' },
        { status: 400 }
      );
    }

    const declarationKeys = [
      'declaration1',
      'declaration2',
      'declaration3',
      'declaration4',
      'declaration5',
      'declaration6',
      'declaration7',
      'declaration8',
    ];

    for (const key of declarationKeys) {
      if (declarations[key] !== true) {
        return NextResponse.json(
          { success: false, error: `All seller declarations must be accepted. Missing: ${key}` },
          { status: 400 }
        );
      }
    }

    // Validate terms acceptance
    if (!termsAccepted || termsAccepted !== true) {
      return NextResponse.json(
        { success: false, error: 'You must accept the Seller Terms & Conditions to register.' },
        { status: 400 }
      );
    }

    // Create producer profile with declarations
    const producer = await createProducer({
      userId: user.id,
      businessName: businessName.trim(),
      abn: abn?.trim() || undefined,
      address: {
        street: address.street.trim(),
        suburb: address.suburb.trim(),
        state: address.state.trim(),
        postcode: address.postcode.trim(),
        country: address.country || 'Australia',
      },
      bio: bio.trim(),
      declarations: {
        declaration1: declarations.declaration1,
        declaration2: declarations.declaration2,
        declaration3: declarations.declaration3,
        declaration4: declarations.declaration4,
        declaration5: declarations.declaration5,
        declaration6: declarations.declaration6,
        declaration7: declarations.declaration7,
        declaration8: declarations.declaration8,
      },
      termsAccepted: termsAccepted,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    return NextResponse.json({
      success: true,
      producer,
      message: 'Producer profile created successfully. Your application has been submitted for review.',
    });
  } catch (error) {
    console.error('Error creating producer:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create producer profile',
      },
      { status: 500 }
    );
  }
}
