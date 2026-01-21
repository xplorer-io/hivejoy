import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { isSessionVerified, clearCheckout } from '@/lib/stripe/checkout-store';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  const nonceCookie = request.cookies.get('checkout_nonce')?.value;
  const sessionCookie = request.cookies.get('checkout_session')?.value;


  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  if (!nonceCookie || !sessionCookie) {
    return NextResponse.json({ error: 'Missing verification cookie' }, { status: 401 });
  }

  if (sessionCookie !== sessionId) {
    return NextResponse.json({ error: 'Session mismatch' }, { status: 403 });
  }


  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const matchesNonce = session.client_reference_id === nonceCookie;

    if (!matchesNonce) {
      return NextResponse.json({ error: 'Session mismatch' }, { status: 403 });
    }

    const verified = isSessionVerified(sessionId);
    const paid = verified && session.payment_status === 'paid';

    const response = NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      paid,
      verified,
    });

    if (verified) {
      clearCheckout(sessionId);
      response.cookies.set('checkout_nonce', '', { maxAge: 0, path: '/' });
      response.cookies.set('checkout_session', '', { maxAge: 0, path: '/' });
    }

    return response;
  } catch (error) {
    console.error('Stripe session lookup error:', error);
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
