import crypto from 'crypto';
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/api/database';
import { registerCheckout } from '@/lib/stripe/checkout-store';
import { createAdminClient } from '@/lib/supabase/admin';

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return null;
  }

  return new Stripe(apiKey, {
    apiVersion: '2026-01-28.clover'
  });
}

interface CheckoutItem {
  productId: string;
  variantId: string;
  quantity: number;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  customerInfo: {
    email: string;
    phone: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    suburb: string;
    state: string;
    postcode: string;
  };
}

const allowedStates = new Set(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']);

const normalizeString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const isValidEmail = (value: string) =>
  value.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidPhone = (value: string) =>
  value.length >= 8 && value.length <= 20 && /^[+\d ()-]+$/.test(value);

const requireLength = (value: string, min: number, max: number) =>
  value.length >= min && value.length <= max;

const resolveBaseUrl = () => {
  const baseUrl = process.env.APP_BASE_URL;
  if (baseUrl) {
    return baseUrl;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  throw new Error('Missing APP_BASE_URL');
};

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const body: CheckoutRequest = await request.json();
    const { items, customerInfo, shippingAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    if (!customerInfo || !shippingAddress) {
      return NextResponse.json({ error: 'Missing checkout details' }, { status: 400 });
    }

    const email = normalizeString(customerInfo.email);
    const phone = normalizeString(customerInfo.phone);
    const firstName = normalizeString(shippingAddress.firstName);
    const lastName = normalizeString(shippingAddress.lastName);
    const address = normalizeString(shippingAddress.address);
    const suburb = normalizeString(shippingAddress.suburb);
    const state = normalizeString(shippingAddress.state);
    const postcode = normalizeString(shippingAddress.postcode);

    if (!isValidEmail(email) || !isValidPhone(phone)) {
      return NextResponse.json({ error: 'Invalid customer info' }, { status: 400 });
    }

    if (
      !requireLength(firstName, 1, 50) ||
      !requireLength(lastName, 1, 50) ||
      !requireLength(address, 5, 120) ||
      !requireLength(suburb, 2, 80) ||
      !allowedStates.has(state) ||
      !/^\d{4}$/.test(postcode)
    ) {
      return NextResponse.json({ error: 'Invalid shipping address' }, { status: 400 });
    }

    const baseUrl = resolveBaseUrl();
    const checkoutNonce = crypto.randomUUID();

    const resolved = await Promise.all(
      items.map(async (item) => {
        const productId = normalizeString(item.productId);
        const variantId = normalizeString(item.variantId);
        const quantity = Number(item.quantity);
        const product = await getProduct(productId);
        const variant = product?.variants.find((entry) => entry.id === variantId);

        if (!product || !variant) {
          throw new Error('Invalid cart item');
        }

        const price = Number(variant.price);
        if (!Number.isFinite(price) || price <= 0) {
          throw new Error('Invalid price for cart item');
        }

        if (!Number.isInteger(quantity) || quantity <= 0 || quantity > variant.stock) {
          throw new Error('Invalid quantity');
        }

        return { product, variant, quantity, price };
      })
    );

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = resolved.map(
      ({ product, variant, quantity, price }) => ({
        price_data: {
          currency: 'aud',
          product_data: {
            name: `${product.title} - ${variant.size}`,
            ...(product.photos?.[0] && { images: [product.photos[0]] }),
          },
          unit_amount: Math.round(price * 100),
        },
        quantity,
      })
    );

    const shippingCost = 12.0;

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'aud',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'afterpay_clearpay'],
      line_items: lineItems,
      customer_email: email,
      client_reference_id: checkoutNonce,
      success_url: `${baseUrl}/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?cancelled=true`,
      metadata: {
        checkoutNonce,
        customerPhone: phone,
        shippingName: `${firstName} ${lastName}`,
        shippingAddress: address,
        shippingSuburb: suburb,
        shippingState: state,
        shippingPostcode: postcode,
      },
    });

    registerCheckout(session.id, {
      nonce: checkoutNonce,
      customerEmail: email,
      items: items.map((item) => ({
        productId: normalizeString(item.productId),
        variantId: normalizeString(item.variantId),
        quantity: Number(item.quantity),
      })),
      createdAt: Date.now(),
    });

    const adminClient = createAdminClient();
    if (adminClient) {
      const { error: checkoutSessionError } = await adminClient
        .from('checkout_sessions')
        .upsert(
          {
            stripe_session_id: session.id,
            checkout_nonce: checkoutNonce,
            customer_email: email,
            customer_phone: phone,
            shipping_name: `${firstName} ${lastName}`,
            shipping_street: address,
            shipping_suburb: suburb,
            shipping_state: state,
            shipping_postcode: postcode,
            shipping_country: 'Australia',
            items: items.map((item) => ({
              productId: normalizeString(item.productId),
              variantId: normalizeString(item.variantId),
              quantity: Number(item.quantity),
            })),
          },
          { onConflict: 'stripe_session_id' }
        );
      if (checkoutSessionError) {
        console.error('Failed to persist checkout session snapshot:', checkoutSessionError);
      }
    }

    const response = NextResponse.json({ url: session.url });
    const checkoutCookieMaxAge = 2 * 60 * 60; // keep in sync with checkout-store TTL

    response.cookies.set('checkout_nonce', checkoutNonce, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: checkoutCookieMaxAge,
    });
    response.cookies.set('checkout_session', session.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: checkoutCookieMaxAge,
    });

    return response;
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const isClientError =
      error instanceof Error &&
      (error.message === 'Invalid cart item' ||
        error.message === 'Invalid quantity' ||
        error.message === 'Invalid price for cart item');
    const status = isClientError ? 400 : 500;
    const message = isClientError ? error.message : 'Failed to create checkout session';

    return NextResponse.json({ error: message }, { status });
  }
}
