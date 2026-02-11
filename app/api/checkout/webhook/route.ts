import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { markSessionVerified } from '@/lib/stripe/checkout-store';
import { dbUpdatePaymentStatus, dbReconcilePaymentByNonce } from '@/lib/db/orders';

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

function isDbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing Stripe webhook configuration' }, { status: 400 });
  }

  const payload = Buffer.from(await request.arrayBuffer());
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature error:', error);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.id && session.payment_status === 'paid') {
      // Keep in-memory store for session verification flow
      markSessionVerified(session.id);

      // Update payment and order status in the database
      if (isDbConfigured()) {
        try {
          let result = await dbUpdatePaymentStatus(
            session.id,
            'succeeded',
            session.payment_intent as string | undefined
          );

          // Fallback: try nonce-based lookup if session ID lookup missed
          if (!result) {
            const nonce = session.client_reference_id || session.metadata?.checkoutNonce;
            if (nonce) {
              console.log(`[webhook] Session ID lookup missed, trying nonce fallback for ${nonce}`);
              result = await dbReconcilePaymentByNonce(
                nonce,
                session.id,
                'succeeded',
                session.payment_intent as string | undefined
              );
            }
          }

          if (!result) {
            // Payment row not found -- return 500 so Stripe retries the webhook
            // (Stripe retries for up to 3 days with exponential backoff)
            console.error(`[webhook] Payment row not found for session ${session.id}, triggering retry`);
            return NextResponse.json(
              { error: 'Payment row not yet available' },
              { status: 500 }
            );
          }

          console.log(`[webhook] Payment succeeded for session ${session.id}, order ${result.orderId}`);
        } catch (error) {
          console.error('[webhook] Failed to update payment status in DB:', error);
          // Return 500 so Stripe retries
          return NextResponse.json(
            { error: 'Internal error processing webhook' },
            { status: 500 }
          );
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
