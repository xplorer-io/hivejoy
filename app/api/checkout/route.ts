import crypto from 'crypto';
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { mockProducts } from '@/lib/api/mock-data';
import { getProduct } from '@/lib/api/database';
import { registerCheckout } from '@/lib/stripe/checkout-store';
import { createClient } from '@/lib/supabase/server';
import {
  dbCreateOrder,
  dbUpdatePaymentStripeSession,
  dbDeleteOrder,
  ensureUserExists,
} from '@/lib/db/orders';
import type { CreateOrderInput } from '@/types/database';
import type { CheckoutItem, CheckoutRequest } from '@/types/components';
import type { Product, ProductVariant } from '@/types';

function getStripeClient() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return null;
  }

  return new Stripe(apiKey, {
    apiVersion: '2026-01-28.clover'
  });
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

function isDbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Resolve a product and variant from database or mock data
 * Tries database first, falls back to mock data if not configured or not found
 */
async function resolveProduct(
  productId: string,
  variantId: string
): Promise<{ product: Product; variant: ProductVariant } | null> {
  // Try database first
  if (isDbConfigured()) {
    try {
      const dbProduct = await getProduct(productId);
      if (dbProduct) {
        // ProductWithDetails extends Product, so we can use it as Product
        // But we need to ensure it has all required fields
        if (!dbProduct.variants || dbProduct.variants.length === 0) {
          console.warn(`Product ${productId} has no variants`);
          // Fall through to mock data
        } else {
          const variant = dbProduct.variants.find((v) => v.id === variantId);
          if (variant) {
            // Validate variant has required fields
            if (typeof variant.price !== 'number' || variant.price <= 0) {
              console.error(`Invalid variant price for ${variantId}:`, variant.price);
              return null;
            }
            return { product: dbProduct, variant };
          } else {
            console.warn(`Variant ${variantId} not found in product ${productId}`);
            // Fall through to mock data
          }
        }
      } else {
        console.warn(`Product ${productId} not found in database`);
        // Fall through to mock data
      }
    } catch (error) {
      console.error('Failed to fetch product from database:', error);
      // Fall through to mock data
    }
  }

  // Fall back to mock data
  const product = mockProducts.find((entry) => entry.id === productId);
  if (!product) {
    return null;
  }

  const variant = product.variants.find((entry) => entry.id === variantId);
  if (!variant) {
    return null;
  }

  return { product, variant };
}

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

    // Resolve products and build line items + group by seller
    const resolvedItems: {
      product: Product;
      variant: ProductVariant;
      quantity: number;
    }[] = [];

    // Resolve all products first
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    
    for (const item of items) {
      try {
        const productId = normalizeString(item.productId);
        const variantId = normalizeString(item.variantId);
        const quantity = Number(item.quantity);

        const resolved = await resolveProduct(productId, variantId);
        if (!resolved) {
          console.error(`Product not found: productId=${productId}, variantId=${variantId}`);
          throw new Error(`Invalid cart item: Product ${productId} or variant ${variantId} not found`);
        }

        const { product, variant } = resolved;

        // Validate product structure
        if (!product || !product.title) {
          console.error('Product missing title:', product);
          throw new Error('Product missing required fields');
        }
        
        if (!variant || !variant.size || typeof variant.price !== 'number') {
          console.error('Invalid variant structure:', variant);
          throw new Error('Invalid variant structure');
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity: ${quantity}`);
        }

        if (quantity > variant.stock) {
          throw new Error(`Insufficient stock: requested ${quantity}, available ${variant.stock}`);
        }

        resolvedItems.push({ product, variant, quantity });

        const unitAmount = Math.round(variant.price * 100);
        if (isNaN(unitAmount) || unitAmount <= 0) {
          console.error('Invalid price:', variant.price, 'unitAmount:', unitAmount);
          throw new Error(`Invalid price: ${variant.price}`);
        }

        // Ensure photos is an array
        const photos = Array.isArray(product.photos) ? product.photos : [];
        
        lineItems.push({
          price_data: {
            currency: 'aud',
            product_data: {
              name: `${product.title} - ${variant.size}`,
              ...(photos[0] && { images: [photos[0]] }),
            },
            unit_amount: unitAmount,
          },
          quantity,
        });
      } catch (itemError) {
        console.error('Error processing cart item:', itemError);
        throw itemError;
      }
    }

    // Validate we have at least one line item
    if (lineItems.length === 0) {
      throw new Error('No valid items in cart');
    }

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

    // ---------------------------------------------------------------
    // STEP 1: Create DB order FIRST (so payment row exists for webhook)
    // ---------------------------------------------------------------
    let dbOrderId: string | null = null;

    if (isDbConfigured()) {
      // Group items by seller
      const sellerMap = new Map<string, CreateOrderInput['subOrders'][number]['items']>();

      for (const { product, variant, quantity } of resolvedItems) {
        const sellerId = product.producerId;
        if (!sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, []);
        }

        // Calculate GST (10% of price)
        const gst = Number((variant.price * 0.1).toFixed(2));

        sellerMap.get(sellerId)!.push({
          productId: product.id,
          variantId: variant.id,
          productTitle: product.title,
          variantSize: variant.size,
          quantity,
          unitPrice: variant.price,
          gst,
          batchSnapshot: {
            batchId: product.batchId,
            region: '', // Will be populated from batch data in production
            harvestDate: '',
            floralSources: [],
          },
        });
      }

      const subOrders: CreateOrderInput['subOrders'] = [];
      const sellerCount = sellerMap.size;
      const shippingPerSeller = shippingCost / sellerCount;

      for (const [sellerId, sellerItems] of sellerMap.entries()) {
        const subtotal = sellerItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        const platformFee = Number((subtotal * 0.10).toFixed(2)); // 10% platform fee

        subOrders.push({
          sellerId,
          items: sellerItems,
          shippingCost: Number(shippingPerSeller.toFixed(2)),
          platformFee,
        });
      }

      // Read the authenticated user's ID from the session
      let buyerId = body.buyerId || '00000000-0000-0000-0000-000000000001';
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          buyerId = user.id;
          // Ensure the user has a row in public.users (Supabase Auth doesn't create one automatically)
          await ensureUserExists(user);
        }
      } catch {
        // Fall back to placeholder if auth check fails (guest checkout)
      }

      const dbOrder = await dbCreateOrder({
        buyerId,
        shippingAddress: {
          street: address,
          suburb,
          state,
          postcode,
          country: 'Australia',
        },
        subOrders,
        // Placeholder -- updated with real session ID after Stripe session creation
        stripeCheckoutSessionId: `pending_${checkoutNonce}`,
      });

      dbOrderId = dbOrder.id;
    }

    // ---------------------------------------------------------------
    // STEP 2: Create Stripe checkout session
    // ---------------------------------------------------------------
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
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
    } catch (stripeError) {
      // Clean up DB order if Stripe session creation fails
      if (dbOrderId) {
        try {
          await dbDeleteOrder(dbOrderId);
        } catch (cleanupError) {
          console.error('Failed to clean up DB order after Stripe failure:', cleanupError);
        }
      }
      throw stripeError;
    }

    // ---------------------------------------------------------------
    // STEP 3: Update payment row with the real Stripe session ID
    // This is FATAL -- without the real session ID, neither the
    // webhook nor session verification can find the payment row.
    // ---------------------------------------------------------------
    if (dbOrderId) {
      try {
        await dbUpdatePaymentStripeSession(dbOrderId, session.id);
      } catch (err) {
        console.error('Failed to update payment with Stripe session ID:', err);
        // Clean up DB order and fail checkout -- user can retry
        try {
          await dbDeleteOrder(dbOrderId);
        } catch (cleanupError) {
          console.error('Failed to clean up DB order after session ID update failure:', cleanupError);
        }
        return NextResponse.json(
          { error: 'Failed to finalize checkout. Please try again.' },
          { status: 500 }
        );
      }
    }

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
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    const isClientError =
      error instanceof Error &&
      (error.message === 'Invalid cart item' || error.message === 'Invalid quantity');
    const status = isClientError ? 400 : 500;
    
    // Include more details in error message for debugging
    const message = isClientError 
      ? error.message 
      : error instanceof Error 
        ? `Failed to create checkout session: ${error.message}`
        : 'Failed to create checkout session';

    return NextResponse.json({ error: message }, { status });
  }
}
