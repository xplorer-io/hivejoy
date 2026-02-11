import { createAdminClient } from '@/lib/supabase/admin';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type {
  Order,
  SubOrder,
  OrderItem,
  Payment,
  Shipment,
  ShipmentEvent,
  SubOrderStatus,
  OrderStatus,
  AddressSnapshot,
} from '@/types';

// =============================================================
// Helper: assemble nested Order from flat DB rows
// =============================================================

interface DbOrder {
  id: string;
  buyer_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_total: number;
  platform_fee_total: number;
  gst_total: number;
  total: number;
  shipping_address: AddressSnapshot;
  billing_address?: AddressSnapshot;
  created_at: string;
  updated_at: string;
}

interface DbSubOrder {
  id: string;
  order_id: string;
  seller_id: string;
  status: SubOrderStatus;
  subtotal: number;
  shipping_cost: number;
  platform_fee: number;
  gst: number;
  total: number;
  created_at: string;
  updated_at: string;
}

interface DbOrderItem {
  id: string;
  sub_order_id: string;
  product_id: string;
  variant_id: string;
  product_title: string;
  variant_size: string;
  quantity: number;
  unit_price: number;
  gst: number;
  batch_snapshot: OrderItem['batchSnapshot'];
  created_at: string;
}

interface DbPayment {
  id: string;
  order_id: string;
  stripe_checkout_session_id?: string;
  stripe_payment_intent_id?: string;
  amount: number;
  currency: string;
  status: Payment['status'];
  method?: Payment['method'];
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

interface DbShipment {
  id: string;
  sub_order_id: string;
  carrier?: Shipment['carrier'];
  tracking_number?: string;
  tracking_url?: string;
  status: Shipment['status'];
  estimated_delivery?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

interface DbShipmentEvent {
  id: string;
  shipment_id: string;
  status: string;
  description: string;
  location?: string;
  occurred_at: string;
  created_at: string;
}

function mapOrderItem(row: DbOrderItem): OrderItem {
  return {
    id: row.id,
    subOrderId: row.sub_order_id,
    productId: row.product_id,
    variantId: row.variant_id,
    productTitle: row.product_title,
    variantSize: row.variant_size,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    gst: row.gst,
    batchSnapshot: row.batch_snapshot,
  };
}

function mapShipmentEvent(row: DbShipmentEvent): ShipmentEvent {
  return {
    id: row.id,
    shipmentId: row.shipment_id,
    status: row.status,
    description: row.description,
    location: row.location,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  };
}

function mapShipment(row: DbShipment, events: ShipmentEvent[]): Shipment {
  return {
    id: row.id,
    subOrderId: row.sub_order_id,
    carrier: row.carrier,
    trackingNumber: row.tracking_number,
    trackingUrl: row.tracking_url,
    status: row.status,
    estimatedDelivery: row.estimated_delivery,
    shippedAt: row.shipped_at,
    deliveredAt: row.delivered_at,
    events,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSubOrder(
  row: DbSubOrder,
  items: OrderItem[],
  shipment?: Shipment
): SubOrder {
  return {
    id: row.id,
    orderId: row.order_id,
    sellerId: row.seller_id,
    status: row.status,
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    platformFee: row.platform_fee,
    gst: row.gst,
    total: row.total,
    items,
    shipment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPayment(row: DbPayment): Payment {
  return {
    id: row.id,
    orderId: row.order_id,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    method: row.method,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrder(
  row: DbOrder,
  subOrders: SubOrder[],
  payment?: Payment
): Order {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    orderNumber: row.order_number,
    status: row.status,
    subtotal: row.subtotal,
    shippingTotal: row.shipping_total,
    platformFeeTotal: row.platform_fee_total,
    gstTotal: row.gst_total,
    total: row.total,
    shippingAddress: row.shipping_address,
    billingAddress: row.billing_address,
    subOrders,
    payment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// =============================================================
// Assemble a full Order with all nested relations
// =============================================================

async function assembleOrders(orderRows: DbOrder[]): Promise<Order[]> {
  if (orderRows.length === 0) return [];

  const supabase = createAdminClient();
  const orderIds = orderRows.map((o) => o.id);

  // Fetch all related data in parallel
  const [subOrdersRes, paymentsRes] = await Promise.all([
    supabase.from('sub_orders').select('*').in('order_id', orderIds),
    supabase.from('payments').select('*').in('order_id', orderIds),
  ]);

  const dbSubOrders: DbSubOrder[] = subOrdersRes.data ?? [];
  const dbPayments: DbPayment[] = paymentsRes.data ?? [];
  const subOrderIds = dbSubOrders.map((so) => so.id);

  // Fetch items, shipments for all sub-orders
  const [itemsRes, shipmentsRes] = await Promise.all([
    subOrderIds.length > 0
      ? supabase.from('order_items').select('*').in('sub_order_id', subOrderIds)
      : Promise.resolve({ data: [] }),
    subOrderIds.length > 0
      ? supabase.from('shipments').select('*').in('sub_order_id', subOrderIds)
      : Promise.resolve({ data: [] }),
  ]);

  const dbItems: DbOrderItem[] = itemsRes.data ?? [];
  const dbShipments: DbShipment[] = shipmentsRes.data ?? [];
  const shipmentIds = dbShipments.map((s) => s.id);

  // Fetch shipment events
  const eventsRes = shipmentIds.length > 0
    ? await supabase.from('shipment_events').select('*').in('shipment_id', shipmentIds).order('occurred_at', { ascending: true })
    : { data: [] };

  const dbEvents: DbShipmentEvent[] = eventsRes.data ?? [];

  // Index by parent ID
  const eventsByShipment = new Map<string, ShipmentEvent[]>();
  for (const e of dbEvents) {
    const mapped = mapShipmentEvent(e);
    const arr = eventsByShipment.get(e.shipment_id) ?? [];
    arr.push(mapped);
    eventsByShipment.set(e.shipment_id, arr);
  }

  const shipmentBySubOrder = new Map<string, Shipment>();
  for (const s of dbShipments) {
    shipmentBySubOrder.set(
      s.sub_order_id,
      mapShipment(s, eventsByShipment.get(s.id) ?? [])
    );
  }

  const itemsBySubOrder = new Map<string, OrderItem[]>();
  for (const i of dbItems) {
    const mapped = mapOrderItem(i);
    const arr = itemsBySubOrder.get(i.sub_order_id) ?? [];
    arr.push(mapped);
    itemsBySubOrder.set(i.sub_order_id, arr);
  }

  const subOrdersByOrder = new Map<string, SubOrder[]>();
  for (const so of dbSubOrders) {
    const mapped = mapSubOrder(
      so,
      itemsBySubOrder.get(so.id) ?? [],
      shipmentBySubOrder.get(so.id)
    );
    const arr = subOrdersByOrder.get(so.order_id) ?? [];
    arr.push(mapped);
    subOrdersByOrder.set(so.order_id, arr);
  }

  const paymentByOrder = new Map<string, Payment>();
  for (const p of dbPayments) {
    paymentByOrder.set(p.order_id, mapPayment(p));
  }

  return orderRows.map((o) =>
    mapOrder(
      o,
      subOrdersByOrder.get(o.id) ?? [],
      paymentByOrder.get(o.id)
    )
  );
}

// =============================================================
// Public API
// =============================================================

export async function dbGetOrders(
  userId: string,
  role: 'buyer' | 'seller',
  filters?: { status?: string; dateFrom?: string; dateTo?: string },
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Order[]; total: number }> {
  const supabase = createAdminClient();

  let orderIds: string[];

  if (role === 'buyer') {
    let query = supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters?.dateTo) query = query.lte('created_at', filters.dateTo);
    if (filters?.status) query = query.eq('status', filters.status);

    const countRes = await query;
    const total = countRes.count ?? 0;

    const dataRes = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const dbOrders: DbOrder[] = dataRes.data ?? [];
    const orders = await assembleOrders(dbOrders);
    return { data: orders, total };
  } else {
    // Seller: find orders containing their sub-orders
    const soRes = await supabase
      .from('sub_orders')
      .select('order_id')
      .eq('seller_id', userId);

    const uniqueOrderIds = [...new Set((soRes.data ?? []).map((r: { order_id: string }) => r.order_id))];
    if (uniqueOrderIds.length === 0) return { data: [], total: 0 };

    let query = supabase
      .from('orders')
      .select('*')
      .in('id', uniqueOrderIds)
      .order('created_at', { ascending: false });

    if (filters?.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters?.dateTo) query = query.lte('created_at', filters.dateTo);

    const dataRes = await query;
    const dbOrders: DbOrder[] = dataRes.data ?? [];
    const allOrders = await assembleOrders(dbOrders);

    // Filter sub-orders to only those belonging to this seller
    const sellerOrders = allOrders.map((order) => ({
      ...order,
      subOrders: order.subOrders.filter((so) => so.sellerId === userId),
    })).filter((o) => o.subOrders.length > 0);

    orderIds = sellerOrders.map((o) => o.id);

    // Apply status filter on sub-order level for seller
    let filtered = sellerOrders;
    if (filters?.status) {
      filtered = filtered.filter((o) =>
        o.subOrders.some((so) => so.status === filters.status)
      );
    }

    const total = filtered.length;
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    void orderIds; // used above
    return { data: paged, total };
  }
}

export async function dbGetOrder(id: string): Promise<Order | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from('orders').select('*').eq('id', id).single();
  if (!data) return null;
  const orders = await assembleOrders([data]);
  return orders[0] ?? null;
}

export interface CreateOrderInput {
  buyerId: string;
  shippingAddress: AddressSnapshot;
  billingAddress?: AddressSnapshot;
  subOrders: {
    sellerId: string;
    items: {
      productId: string;
      variantId: string;
      productTitle: string;
      variantSize: string;
      quantity: number;
      unitPrice: number;
      gst: number;
      batchSnapshot: OrderItem['batchSnapshot'];
    }[];
    shippingCost: number;
    platformFee: number;
  }[];
  stripeCheckoutSessionId: string;
}

export async function dbCreateOrder(input: CreateOrderInput): Promise<Order> {
  const supabase = createAdminClient();

  // Calculate totals
  let subtotal = 0;
  let shippingTotal = 0;
  let platformFeeTotal = 0;
  let gstTotal = 0;

  const subOrderInputs = input.subOrders.map((so) => {
    const soSubtotal = so.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const soGst = so.items.reduce((sum, i) => sum + i.gst * i.quantity, 0);
    const soTotal = soSubtotal + so.shippingCost + soGst;

    subtotal += soSubtotal;
    shippingTotal += so.shippingCost;
    platformFeeTotal += so.platformFee;
    gstTotal += soGst;

    return { ...so, soSubtotal, soGst, soTotal };
  });

  const total = subtotal + shippingTotal + gstTotal;

  // Generate order number
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  const orderNumber = `HJ-${dateStr}-${seq}`;

  // Insert order
  const { data: orderRow, error: orderErr } = await supabase
    .from('orders')
    .insert({
      buyer_id: input.buyerId,
      order_number: orderNumber,
      status: 'pending',
      subtotal,
      shipping_total: shippingTotal,
      platform_fee_total: platformFeeTotal,
      gst_total: gstTotal,
      total,
      shipping_address: input.shippingAddress,
      billing_address: input.billingAddress ?? null,
    })
    .select()
    .single();

  if (orderErr || !orderRow) {
    throw new Error(`Failed to create order: ${orderErr?.message}`);
  }

  // Insert payment
  await supabase.from('payments').insert({
    order_id: orderRow.id,
    stripe_checkout_session_id: input.stripeCheckoutSessionId,
    amount: total,
    currency: 'AUD',
    status: 'pending',
  });

  // Insert sub-orders and items
  for (const soInput of subOrderInputs) {
    const { data: soRow, error: soErr } = await supabase
      .from('sub_orders')
      .insert({
        order_id: orderRow.id,
        seller_id: soInput.sellerId,
        status: 'pending',
        subtotal: soInput.soSubtotal,
        shipping_cost: soInput.shippingCost,
        platform_fee: soInput.platformFee,
        gst: soInput.soGst,
        total: soInput.soTotal,
      })
      .select()
      .single();

    if (soErr || !soRow) {
      throw new Error(`Failed to create sub-order: ${soErr?.message}`);
    }

    // Insert order items
    const itemRows = soInput.items.map((item) => ({
      sub_order_id: soRow.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_title: item.productTitle,
      variant_size: item.variantSize,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      gst: item.gst,
      batch_snapshot: item.batchSnapshot,
    }));

    await supabase.from('order_items').insert(itemRows);
  }

  // Return the assembled order
  const result = await dbGetOrder(orderRow.id);
  if (!result) throw new Error('Order created but could not be retrieved');
  return result;
}

export async function dbUpdateSubOrderStatus(
  subOrderId: string,
  status: SubOrderStatus
): Promise<void> {
  const supabase = createAdminClient();

  // Update sub-order
  const { data: soRow } = await supabase
    .from('sub_orders')
    .update({ status })
    .eq('id', subOrderId)
    .select('order_id')
    .single();

  if (!soRow) return;

  // Derive parent order status
  const { data: allSubOrders } = await supabase
    .from('sub_orders')
    .select('status')
    .eq('order_id', soRow.order_id);

  if (!allSubOrders) return;

  const statuses = allSubOrders.map((so: { status: string }) => so.status);
  let orderStatus: OrderStatus = 'confirmed';

  if (statuses.every((s: string) => s === 'delivered')) {
    orderStatus = 'delivered';
  } else if (statuses.every((s: string) => s === 'cancelled')) {
    orderStatus = 'cancelled';
  } else if (statuses.some((s: string) => s === 'shipped' || s === 'delivered')) {
    orderStatus = 'partially_shipped';
  } else if (statuses.every((s: string) => s === 'shipped')) {
    orderStatus = 'shipped';
  }

  await supabase
    .from('orders')
    .update({ status: orderStatus })
    .eq('id', soRow.order_id);
}

export async function dbUpdatePaymentStatus(
  stripeCheckoutSessionId: string,
  paymentStatus: Payment['status'],
  stripePaymentIntentId?: string
): Promise<{ orderId: string } | null> {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = { status: paymentStatus };
  if (stripePaymentIntentId) {
    updateData.stripe_payment_intent_id = stripePaymentIntentId;
  }
  if (paymentStatus === 'succeeded') {
    updateData.paid_at = new Date().toISOString();
  }

  const { data: paymentRow } = await supabase
    .from('payments')
    .update(updateData)
    .eq('stripe_checkout_session_id', stripeCheckoutSessionId)
    .select('order_id')
    .single();

  if (!paymentRow) return null;

  // When payment succeeds, confirm the order and all sub-orders
  if (paymentStatus === 'succeeded') {
    await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', paymentRow.order_id);

    await supabase
      .from('sub_orders')
      .update({ status: 'confirmed' })
      .eq('order_id', paymentRow.order_id);
  }

  return { orderId: paymentRow.order_id };
}

export async function dbUpdatePaymentStripeSession(
  orderId: string,
  stripeCheckoutSessionId: string
): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from('payments')
    .update({ stripe_checkout_session_id: stripeCheckoutSessionId })
    .eq('order_id', orderId);
}

export async function dbDeleteOrder(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  // CASCADE deletes payments, sub_orders, order_items
  await supabase.from('orders').delete().eq('id', orderId);
}

export async function dbGetPaymentBySession(
  stripeCheckoutSessionId: string
): Promise<Payment | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_checkout_session_id', stripeCheckoutSessionId)
    .single();

  if (!data) return null;
  return mapPayment(data);
}

/**
 * Find a payment by its checkout nonce (matches the placeholder session ID pattern `pending_<nonce>`).
 * Used as a fallback when the real Stripe session ID was never persisted.
 */
export async function dbGetPaymentByNonce(
  nonce: string
): Promise<Payment | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_checkout_session_id', `pending_${nonce}`)
    .single();

  if (!data) return null;
  return mapPayment(data);
}

/**
 * Reconcile a payment that still has a placeholder session ID.
 * Updates the session ID to the real one, then updates the payment status.
 * Returns the order ID on success, null if the nonce-based row wasn't found.
 */
export async function dbReconcilePaymentByNonce(
  nonce: string,
  realStripeSessionId: string,
  paymentStatus: Payment['status'],
  stripePaymentIntentId?: string
): Promise<{ orderId: string } | null> {
  const supabase = createAdminClient();

  // First, patch the placeholder session ID to the real one
  const { data: patched } = await supabase
    .from('payments')
    .update({ stripe_checkout_session_id: realStripeSessionId })
    .eq('stripe_checkout_session_id', `pending_${nonce}`)
    .select('order_id')
    .single();

  if (!patched) return null;

  // Now update the payment status using the standard function
  return dbUpdatePaymentStatus(realStripeSessionId, paymentStatus, stripePaymentIntentId);
}

/**
 * Ensure the authenticated Supabase Auth user has a corresponding row
 * in the public.users table. Uses upsert so it's safe to call repeatedly.
 */
export async function ensureUserExists(authUser: SupabaseAuthUser): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('users').upsert(
    {
      id: authUser.id,
      email: authUser.email || '',
      phone: authUser.phone || null,
      role: 'consumer',
      status: 'active',
    },
    { onConflict: 'id', ignoreDuplicates: true }
  );

  if (error) {
    console.error('[ensureUserExists] Failed to upsert user row:', error);
    throw error;
  }
}
