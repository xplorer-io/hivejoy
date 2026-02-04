import { createProducer } from '@/lib/api/database';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessName, bio, profileImage, userId } = body;

    if (!businessName || !bio || !profileImage) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID is required. Please sign in first, or the system will generate a test UUID.' 
        },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid user ID format. Expected UUID, got: ${userId}. Please sign in to get a valid user ID.` 
        },
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
