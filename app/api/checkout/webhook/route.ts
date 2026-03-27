import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { markSessionVerified } from '@/lib/stripe/checkout-store';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

type SnapshotItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

type CheckoutSessionRow = {
  stripe_session_id: string;
  customer_email: string;
  shipping_street: string;
  shipping_suburb: string;
  shipping_state: string;
  shipping_postcode: string;
  shipping_country: string;
  items: SnapshotItem[];
};

const SHIPPING_COST = 12;

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return null;
  }

  return new Stripe(apiKey, {
    apiVersion: '2026-01-28.clover',
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const adminClient = createAdminClient();

  if (!stripe || !signature || !webhookSecret || !adminClient) {
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

  const { data: existingEvent } = await adminClient
    .from('stripe_webhook_events')
    .select('id, processed_at, processing_error')
    .eq('stripe_event_id', event.id)
    .maybeSingle();

  if (existingEvent) {
    const existing = existingEvent as { processed_at?: string | null; processing_error?: string | null };
    if (existing.processed_at && !existing.processing_error) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  if (!existingEvent) {
    const { error: insertEventError } = await adminClient.from('stripe_webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
    });

    if (insertEventError) {
      return NextResponse.json({ error: 'Failed to persist webhook event' }, { status: 500 });
    }
  } else {
    const { error: resetEventError } = await adminClient
      .from('stripe_webhook_events')
      .update({ event_type: event.type, processed_at: null, processing_error: null })
      .eq('stripe_event_id', event.id);
    if (resetEventError) {
      return NextResponse.json({ error: 'Failed to reset webhook event state' }, { status: 500 });
    }
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.id && session.payment_status === 'paid') {
        markSessionVerified(session.id);
        await persistPaidCheckout(adminClient, session);
      }
    }

    await adminClient
      .from('stripe_webhook_events')
      .update({ processed_at: new Date().toISOString(), processing_error: null })
      .eq('stripe_event_id', event.id);
  } catch (error) {
    await adminClient
      .from('stripe_webhook_events')
      .update({
        processed_at: new Date().toISOString(),
        processing_error: error instanceof Error ? error.message : 'Unknown processing error',
      })
      .eq('stripe_event_id', event.id);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'string' ? Number(value) : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function persistPaidCheckout(
  adminClient: NonNullable<ReturnType<typeof createAdminClient>>,
  session: Stripe.Checkout.Session
) {
  const { data: snapshot, error: snapshotError } = await adminClient
    .from('checkout_sessions')
    .select(
      'stripe_session_id, customer_email, shipping_street, shipping_suburb, shipping_state, shipping_postcode, shipping_country, items'
    )
    .eq('stripe_session_id', session.id)
    .maybeSingle();

  if (snapshotError || !snapshot) {
    throw new Error('Checkout session snapshot not found');
  }

  const checkout = snapshot as CheckoutSessionRow;
  const snapshotItems = Array.isArray(checkout.items) ? checkout.items : [];

  const { data: buyerProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', checkout.customer_email)
    .maybeSingle();
  const buyerId = (buyerProfile as { id?: string } | null)?.id ?? null;

  type EnrichedItem = {
    sellerId: string;
    productId: string;
    variantId: string;
    productTitle: string;
    variantSize: string;
    quantity: number;
    unitPrice: number;
    batchId: string | null;
    batchRegion: string | null;
    batchHarvestDate: string | null;
    batchFloralSources: string[] | null;
  };

  const enrichedItems: EnrichedItem[] = [];

  for (const item of snapshotItems) {
    const quantity = Math.max(1, Math.floor(toNumber(item.quantity, 1)));
    const { data: productRow, error: productError } = await adminClient
      .from('products')
      .select('id, title, producer_id, batch_id')
      .eq('id', item.productId)
      .maybeSingle();
    const { data: variantRow, error: variantError } = await adminClient
      .from('product_variants')
      .select('id, size, price')
      .eq('id', item.variantId)
      .maybeSingle();

    if (productError || variantError || !productRow || !variantRow) {
      throw new Error(`Invalid product/variant in checkout snapshot for session ${session.id}`);
    }

    const { data: producerRow, error: producerError } = await adminClient
      .from('producers')
      .select('user_id')
      .eq('id', (productRow as { producer_id: string }).producer_id)
      .maybeSingle();
    if (producerError || !producerRow) {
      throw new Error('Missing producer for checkout item');
    }

    const batchId = (productRow as { batch_id?: string | null }).batch_id ?? null;
    let batchRegion: string | null = null;
    let batchHarvestDate: string | null = null;
    let batchFloralSources: string[] | null = null;
    if (batchId) {
      const { data: batchRow } = await adminClient
        .from('batches')
        .select('region, harvest_date, floral_source_tags')
        .eq('id', batchId)
        .maybeSingle();
      if (batchRow) {
        const row = batchRow as {
          region?: string | null;
          harvest_date?: string | null;
          floral_source_tags?: string[] | null;
        };
        batchRegion = row.region ?? null;
        batchHarvestDate = row.harvest_date ?? null;
        batchFloralSources = row.floral_source_tags ?? null;
      }
    }

    const variant = variantRow as { id: string; size: string; price: string | number };
    const product = productRow as { id: string; title: string };
    const producer = producerRow as { user_id: string };

    enrichedItems.push({
      sellerId: producer.user_id,
      productId: product.id,
      variantId: variant.id,
      productTitle: product.title,
      variantSize: variant.size,
      quantity,
      unitPrice: toNumber(variant.price),
      batchId,
      batchRegion,
      batchHarvestDate,
      batchFloralSources,
    });
  }

  const groupedBySeller = enrichedItems.reduce<Record<string, EnrichedItem[]>>((acc, item) => {
    if (!acc[item.sellerId]) {
      acc[item.sellerId] = [];
    }
    acc[item.sellerId].push(item);
    return acc;
  }, {});

  const sellerEntries = Object.entries(groupedBySeller);
  if (sellerEntries.length === 0) {
    throw new Error('No checkout items to persist');
  }

  const createdOrderIds: string[] = [];

  for (const [indexString, [sellerId, sellerItems]] of sellerEntries.entries()) {
    const subtotal = sellerItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const shippingCost = indexString === 0 ? SHIPPING_COST : 0;
    const total = subtotal + shippingCost;
    const paymentIntent =
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

    const { data: orderRow, error: orderError } = await adminClient
      .from('orders')
      .insert({
        buyer_id: buyerId,
        seller_id: sellerId,
        subtotal,
        shipping_cost: shippingCost,
        platform_fee: 0,
        gst_total: 0,
        total,
        status: 'confirmed',
        shipping_street: checkout.shipping_street,
        shipping_suburb: checkout.shipping_suburb,
        shipping_state: checkout.shipping_state,
        shipping_postcode: checkout.shipping_postcode,
        shipping_country: checkout.shipping_country,
        stripe_session_id: session.id,
        payment_intent_id: paymentIntent ?? null,
        payment_status: session.payment_status,
      })
      .select('id')
      .single();

    if (orderError || !orderRow) {
      throw new Error('Failed to create order row from webhook');
    }

    const orderId = (orderRow as { id: string }).id;
    createdOrderIds.push(orderId);

    const { error: itemsError } = await adminClient.from('order_items').insert(
      sellerItems.map((item) => ({
        order_id: orderId,
        variant_id: item.variantId,
        product_id: item.productId,
        product_title: item.productTitle,
        variant_size: item.variantSize,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        gst: 0,
        batch_id: item.batchId,
        batch_region: item.batchRegion,
        batch_harvest_date: item.batchHarvestDate,
        batch_floral_sources: item.batchFloralSources,
      }))
    );
    if (itemsError) {
      throw new Error('Failed to create order items from webhook');
    }
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
  const amountTotal = toNumber(session.amount_total) / 100;
  const currency = (session.currency ?? 'aud').toLowerCase();

  const { error: paymentError } = await adminClient.from('payments').upsert(
    {
      order_id: createdOrderIds[0] ?? null,
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId ?? null,
      amount_total: amountTotal,
      currency,
      payment_status: session.payment_status ?? 'paid',
      paid_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_session_id' }
  );
  if (paymentError) {
    throw new Error('Failed to upsert payment row');
  }
}
