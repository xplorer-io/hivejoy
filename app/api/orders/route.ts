import { NextRequest, NextResponse } from 'next/server';
import type { Order, OrderFilters } from '@/types';
import { createClient } from '@/lib/supabase/server';

type OrderRow = {
  id: string;
  buyer_id: string;
  seller_id: string;
  subtotal: string | number;
  shipping_cost: string | number;
  platform_fee: string | number;
  gst_total: string | number;
  total: string | number;
  status: Order['status'];
  shipping_street: string;
  shipping_suburb: string;
  shipping_state: string;
  shipping_postcode: string;
  shipping_country: string;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  variant_id: string;
  product_id: string;
  product_title: string;
  variant_size: string;
  quantity: number;
  unit_price: string | number;
  gst: string | number;
  batch_id: string | null;
  batch_region: string | null;
  batch_harvest_date: string | null;
  batch_floral_sources: string[] | null;
};

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapOrderRow(row: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    subtotal: toNumber(row.subtotal),
    shippingCost: toNumber(row.shipping_cost),
    platformFee: toNumber(row.platform_fee),
    gstTotal: toNumber(row.gst_total),
    total: toNumber(row.total),
    status: row.status,
    shippingAddress: {
      street: row.shipping_street,
      suburb: row.shipping_suburb,
      state: row.shipping_state,
      postcode: row.shipping_postcode,
      country: row.shipping_country || 'Australia',
    },
    trackingNumber: row.tracking_number ?? undefined,
    carrier: row.carrier ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map((item) => ({
      id: item.id,
      orderId: item.order_id,
      variantId: item.variant_id,
      productId: item.product_id,
      productTitle: item.product_title,
      variantSize: item.variant_size,
      quantity: item.quantity,
      unitPrice: toNumber(item.unit_price),
      gst: toNumber(item.gst),
      batchSnapshot: {
        batchId: item.batch_id ?? '',
        region: item.batch_region ?? '',
        harvestDate: item.batch_harvest_date ?? '',
        floralSources: item.batch_floral_sources ?? [],
      },
    })),
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '10');
  const status = searchParams.get('status');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const orderId = searchParams.get('id');

  if (!userId || (role !== 'buyer' && role !== 'seller')) {
    return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
  }

  if (orderId) {
    const { data: singleOrder, error: singleOrderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();
    if (singleOrderError || !singleOrder) {
      return NextResponse.json({ data: null });
    }

    const ownerField = role === 'buyer' ? 'buyer_id' : 'seller_id';
    const ownerId = (singleOrder as { buyer_id: string; seller_id: string })[ownerField];
    if (ownerId !== userId) {
      return NextResponse.json({ data: null });
    }

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      data: mapOrderRow(singleOrder as OrderRow, (items ?? []) as OrderItemRow[]),
    });
  }

  const start = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
  const end = start + Math.max(pageSize, 1) - 1;
  const ownerField = role === 'buyer' ? 'buyer_id' : 'seller_id';

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq(ownerField, userId)
    .order('created_at', { ascending: false })
    .range(start, end);

  const filters: OrderFilters = {};
  if (status) {
    filters.status = status as Order['status'];
    query = query.eq('status', status);
  }
  if (dateFrom) {
    filters.dateFrom = dateFrom;
    query = query.gte('created_at', dateFrom);
  }
  if (dateTo) {
    filters.dateTo = dateTo;
    query = query.lte('created_at', dateTo);
  }

  const { data: orders, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }

  const orderRows = (orders ?? []) as OrderRow[];
  const orderIds = orderRows.map((row) => row.id);

  const itemsByOrderId = new Map<string, OrderItemRow[]>();
  if (orderIds.length > 0) {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds)
      .order('created_at', { ascending: true });

    for (const item of (orderItems ?? []) as OrderItemRow[]) {
      const existing = itemsByOrderId.get(item.order_id);
      if (existing) {
        existing.push(item);
      } else {
        itemsByOrderId.set(item.order_id, [item]);
      }
    }
  }

  const mapped = orderRows.map((row) => mapOrderRow(row, itemsByOrderId.get(row.id) ?? []));
  const total = count ?? mapped.length;
  const totalPages = Math.ceil(total / Math.max(pageSize, 1));

  return NextResponse.json({
    data: mapped,
    total,
    page,
    pageSize,
    totalPages,
  });
}
