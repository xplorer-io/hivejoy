import { NextResponse } from 'next/server';
import { sendSellerRegistrationEmail } from '@/lib/sendgrid/email';

/**
 * API route to manually send seller registration email
 * This can be used for testing or as a fallback
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessName, email, abn, address, bio, producerId, userId, agentEmail } = body;

    if (!businessName || !email || !address || !bio || !producerId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use provided email, environment variable, or default to adarsha.aryal653@gmail.com
    const recipientEmail = agentEmail || process.env.SENDGRID_AGENT_EMAIL || 'adarsha.aryal653@gmail.com';

    const result = await sendSellerRegistrationEmail(
      {
        businessName,
        email,
        abn,
        address,
        bio,
        producerId,
        userId,
      },
      recipientEmail
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in seller registration email route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
