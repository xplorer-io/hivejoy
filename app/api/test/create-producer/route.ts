import { createProducer } from '@/lib/api/database';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  // Restrict to non-production environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    // Get authenticated user from session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { businessName, bio, profileImage } = body;
    
    // Use authenticated user's ID, not from request body
    const userId = user.id;

    if (!businessName || !bio || !profileImage) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const producer = await createProducer({
      userId,
      businessName,
      bio,
      profileImage,
      address: {
        street: '123 Test Street',
        suburb: 'Test Suburb',
        state: 'VIC',
        postcode: '3000',
        country: 'Australia',
      },
    });

    return NextResponse.json({ success: true, producer });
  } catch (error) {
    console.error('Error creating producer:', error);
    
    // Provide more helpful error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for foreign key constraint errors
    if (errorMessage.includes('foreign key') || errorMessage.includes('violates foreign key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID does not exist in the database. Please sign in first to create a valid user account.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
