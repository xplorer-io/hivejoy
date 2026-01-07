import type { Order, OrderFilters, PaginatedResponse } from '@/types';
import { mockOrders } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getOrders(
  userId: string,
  role: 'buyer' | 'seller',
  filters?: OrderFilters,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<Order>> {
  await delay(300);

  let filtered = role === 'buyer'
    ? mockOrders.filter(o => o.buyerId === userId)
    : mockOrders.filter(o => o.sellerId === userId);

  if (filters?.status) {
    filtered = filtered.filter(o => o.status === filters.status);
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

  return {
    data: paged,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getOrder(id: string): Promise<Order | null> {
  await delay(200);
  return mockOrders.find(o => o.id === id) || null;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  await delay(500);
  
  const newOrder: Order = {
    ...orderData,
    id: `order-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockOrders.push(newOrder);
  return newOrder;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  trackingInfo?: { trackingNumber: string; carrier: string }
): Promise<Order | null> {
  await delay(300);
  
  const index = mockOrders.findIndex(o => o.id === orderId);
  if (index === -1) return null;
  
  mockOrders[index] = {
    ...mockOrders[index],
    status,
    ...(trackingInfo && trackingInfo),
    updatedAt: new Date().toISOString(),
  };
  
  return mockOrders[index];
}

export async function getSellerOrderStats(sellerId: string) {
  await delay(200);
  
  const sellerOrders = mockOrders.filter(o => o.sellerId === sellerId);
  
  return {
    totalOrders: sellerOrders.length,
    pendingOrders: sellerOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
    processingOrders: sellerOrders.filter(o => o.status === 'processing' || o.status === 'packed').length,
    completedOrders: sellerOrders.filter(o => o.status === 'delivered').length,
    totalRevenue: sellerOrders.reduce((sum, o) => sum + o.subtotal, 0),
  };
}

