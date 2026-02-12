// =============================================
// Order Types
// =============================================

import type { AddressSnapshot } from './address';
import { Payment } from './payment';
import { Shipment } from './shipment';


export type OrderStatus = 'pending' | 'confirmed' | 'partially_shipped' | 'shipped' | 'delivered' | 'cancelled';

export type SubOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export interface Order {
  id: string;
  buyerId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingTotal: number;
  platformFeeTotal: number;
  gstTotal: number;
  total: number;
  shippingAddress: AddressSnapshot;
  billingAddress?: AddressSnapshot;
  subOrders: SubOrder[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface SubOrder {
  id: string;
  orderId: string;
  sellerId: string;
  status: SubOrderStatus;
  subtotal: number;
  shippingCost: number;
  platformFee: number;
  gst: number;
  total: number;
  items: OrderItem[];
  shipment?: Shipment;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  subOrderId: string;
  variantId: string;
  productId: string;
  productTitle: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
  gst: number;
  batchSnapshot: {
    batchId: string;
    region: string;
    harvestDate: string;
    floralSources: string[];
  };
}

export interface OrderFilters {
  status?: OrderStatus | SubOrderStatus;
  dateFrom?: string;
  dateTo?: string;
}
