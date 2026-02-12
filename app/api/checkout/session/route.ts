import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { isSessionVerified, clearCheckout, markSessionVerified } from '@/lib/stripe/checkout-store';
import {
  dbGetPaymentBySession,
  dbGetPaymentByNonce,
  dbUpdatePaymentStatus,
  dbReconcilePaymentByNonce,
} from '@/lib/db/orders';

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return null;
  }

  return new Stripe(apiKey, {
    apiVersion: '2026-01-28.clover',
  });
}

function isDbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request: NextRequest) {
  const stripe = getStripeClient();
  const sessionId = request.nextUrl.searchParams.get('session_id');
  const nonceCookie = request.cookies.get('checkout_nonce')?.value;
  const sessionCookie = request.cookies.get('checkout_session')?.value;


  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  // If cookies are missing (common after Stripe redirect clears them),
  // fall back to a DB-only check. The Stripe session ID is opaque and
  // unguessable, so this is safe for a read-only status check.
  const hasCookies = !!(nonceCookie && sessionCookie);

  if (hasCookies && sessionCookie !== sessionId) {
    return NextResponse.json({ error: 'Session mismatch' }, { status: 403 });
  }

  // DB-only fallback when cookies are missing
  if (!hasCookies && isDbConfigured()) {
    try {
      const payment = await dbGetPaymentBySession(sessionId);
      if (payment && payment.status === 'succeeded') {
        return NextResponse.json({
          status: 'complete',
          payment_status: 'paid',
          paid: true,
          verified: true,
        });
      }
      // Payment exists but not yet succeeded -- return pending so client polls
      if (payment) {
        return NextResponse.json({
          status: 'open',
          payment_status: 'unpaid',
          paid: false,
          verified: false,
        });
      }
    } catch (error) {
      console.error('[session] DB-only fallback failed:', error);
    }
    // No payment found in DB and no cookies -- can't verify
    return NextResponse.json({ error: 'Missing verification cookie' }, { status: 401 });
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

    // Check in-memory store first
    let verified = isSessionVerified(sessionId);
    const paid = session.payment_status === 'paid';

    // If not verified in memory, check the database as a fallback
    // (handles server restarts where in-memory state is lost)
    if (!verified && isDbConfigured()) {
      try {
        let payment = await dbGetPaymentBySession(sessionId);

        // Nonce-based fallback: if session ID lookup missed, try matching by nonce
        if (!payment && nonceCookie) {
          payment = await dbGetPaymentByNonce(nonceCookie);
          if (payment) {
            console.log(`[session] Found payment via nonce fallback for ${nonceCookie}`);
          }
        }

        if (payment && payment.status === 'succeeded') {
          // DB already has the correct status
          verified = true;
          markSessionVerified(sessionId);
        } else if (paid && payment && payment.status !== 'succeeded') {
          // Reconciliation: Stripe says paid but DB still shows pending/other
          // Try standard update first, then nonce-based reconciliation
          let result = await dbUpdatePaymentStatus(
            sessionId,
            'succeeded',
            session.payment_intent as string | undefined
          );
          if (!result && nonceCookie) {
            result = await dbReconcilePaymentByNonce(
              nonceCookie,
              sessionId,
              'succeeded',
              session.payment_intent as string | undefined
            );
          }
          if (result) {
            verified = true;
            markSessionVerified(sessionId);
            console.log(`[session] Reconciled payment for session ${sessionId}`);
          }
        }
      } catch (error) {
        console.error('Failed to check/reconcile payment status from DB:', error);
      }
    }

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

