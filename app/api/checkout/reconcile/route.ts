import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return null;
  }

  return new Stripe(apiKey, {
    apiVersion: '2026-01-28.clover',
  });
}

export async function GET(request: NextRequest) {
  const stripe = getStripeClient();
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntent =
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_email,
      paymentIntentId: paymentIntent,
      isPaidAndComplete: session.payment_status === 'paid' && session.status === 'complete',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve Stripe session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
