import { NextResponse } from 'next/server';
import { sendSellerRegistrationEmail } from '@/lib/sendgrid/email';

/**
 * Test endpoint to send seller registration email
 * This endpoint allows you to test the email functionality without creating a producer
 * Usage: POST /api/test/send-seller-email
 */
export async function POST(request: Request) {
  // Restrict to non-production environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      businessName,
      email,
      abn,
      address,
      bio,
      producerId,
      userId,
      agentEmail,
    } = body;

    // Validate required fields
    if (!businessName || !email || !address || !bio || !producerId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['businessName', 'email', 'address', 'bio', 'producerId', 'userId'],
        },
        { status: 400 }
      );
    }

    // Use provided email, environment variable, or default
    const recipientEmail =
      agentEmail ||
      process.env.SENDGRID_AGENT_EMAIL ||
      'adarsha.aryal653@gmail.com';

    console.log('Sending test email to:', recipientEmail);
    console.log('SendGrid API Key configured:', !!process.env.SENDGRID_API_KEY);

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
        {
          success: false,
          error: result.error,
          message: 'Failed to send email. Check your SendGrid configuration.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully!',
      recipient: recipientEmail,
    });
  } catch (error) {
    console.error('Error in test email route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
