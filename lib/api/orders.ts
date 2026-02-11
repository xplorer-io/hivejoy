import type { Order, SubOrder, SubOrderStatus, OrderFilters, PaginatedResponse } from '@/types';
import { dbGetOrders, dbGetOrder, dbUpdateSubOrderStatus } from '@/lib/db/orders';
import { mockOrders } from './mock-data';

/**
 * Check if the Supabase service role key is configured.
 * If not, fall back to mock data.
 */
function isDbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getOrders(
  userId: string,
  role: 'buyer' | 'seller',
  filters?: OrderFilters,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<Order>> {
  if (isDbConfigured()) {
    const result = await dbGetOrders(userId, role, filters, page, pageSize);
    return {
      data: result.data,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize),
    };
  }

  // Fallback: mock data
  let filtered: Order[];

  if (role === 'buyer') {
    filtered = mockOrders.filter(o => o.buyerId === userId);
  } else {
    filtered = mockOrders
      .map(order => {
        const sellerSubOrders = order.subOrders.filter(so => so.sellerId === userId);
        if (sellerSubOrders.length === 0) return null;
        return { ...order, subOrders: sellerSubOrders };
      })
      .filter((o): o is Order => o !== null);
  }

  if (filters?.status) {
    filtered = filtered.filter(o => {
      if (o.status === filters.status) return true;
      return o.subOrders.some(so => so.status === filters.status);
    });
  }

  if (filters?.dateFrom) {
    filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(filters.dateFrom!));
  }

  if (filters?.dateTo) {
    filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(filters.dateTo!));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return { data: paged, total, page, pageSize, totalPages };
}

export async function getOrder(id: string): Promise<Order | null> {
  if (isDbConfigured()) {
    return dbGetOrder(id);
  }
  return mockOrders.find(o => o.id === id) || null;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  // This function is only used by mock path now;
  // the checkout route uses dbCreateOrder directly.
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(mockOrders.length + 1).padStart(4, '0');

  const newOrder: Order = {
    ...orderData,
    id: `order-${Date.now()}`,
    orderNumber: `HJ-${dateStr}-${seq}`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  mockOrders.push(newOrder);
  return newOrder;
}

export async function updateSubOrderStatus(
  orderId: string,
  subOrderId: string,
  status: SubOrderStatus,
  trackingInfo?: { trackingNumber: string; carrier: string }
): Promise<SubOrder | null> {
  if (isDbConfigured()) {
    await dbUpdateSubOrderStatus(subOrderId, status);
    // Re-fetch the order to return the updated sub-order
    const order = await dbGetOrder(orderId);
    if (!order) return null;
    return order.subOrders.find(so => so.id === subOrderId) ?? null;
  }

  // Fallback: mock data
  const orderIndex = mockOrders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return null;

  const order = mockOrders[orderIndex];
  const subOrderIndex = order.subOrders.findIndex(so => so.id === subOrderId);
  if (subOrderIndex === -1) return null;

  const subOrder = order.subOrders[subOrderIndex];
  const updatedSubOrder: SubOrder = {
    ...subOrder,
    status,
    updatedAt: new Date().toISOString(),
  };

  if (trackingInfo && updatedSubOrder.shipment) {
    updatedSubOrder.shipment = {
      ...updatedSubOrder.shipment,
      trackingNumber: trackingInfo.trackingNumber,
      carrier: trackingInfo.carrier as SubOrder['shipment'] extends { carrier: infer C } ? C : never,
      updatedAt: new Date().toISOString(),
    };
  }

  order.subOrders[subOrderIndex] = updatedSubOrder;
  order.updatedAt = new Date().toISOString();

  const allStatuses = order.subOrders.map(so => so.status);
  if (allStatuses.every(s => s === 'delivered')) {
    order.status = 'delivered';
  } else if (allStatuses.every(s => s === 'cancelled')) {
    order.status = 'cancelled';
  } else if (allStatuses.some(s => s === 'shipped' || s === 'delivered')) {
    order.status = 'partially_shipped';
  } else if (allStatuses.every(s => s === 'confirmed' || s === 'processing' || s === 'packed')) {
    order.status = 'confirmed';
  }

  mockOrders[orderIndex] = order;
  return updatedSubOrder;
}

export async function getSellerOrderStats(sellerId: string) {
  // Collect all sub-orders for this seller
  const sellerSubOrders: SubOrder[] = [];

  if (isDbConfigured()) {
    const result = await dbGetOrders(sellerId, 'seller');
    for (const order of result.data) {
      for (const subOrder of order.subOrders) {
        sellerSubOrders.push(subOrder);
      }
    }
  } else {
    for (const order of mockOrders) {
      for (const subOrder of order.subOrders) {
        if (subOrder.sellerId === sellerId) {
          sellerSubOrders.push(subOrder);
        }
      }
    }
  }

  return {
    totalOrders: sellerSubOrders.length,
    pendingOrders: sellerSubOrders.filter(so => so.status === 'pending' || so.status === 'confirmed').length,
    processingOrders: sellerSubOrders.filter(so => so.status === 'processing' || so.status === 'packed').length,
    completedOrders: sellerSubOrders.filter(so => so.status === 'delivered').length,
    totalRevenue: sellerSubOrders.reduce((sum, so) => sum + so.subtotal, 0),
  };
}
