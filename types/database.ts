// =============================================
// Database Types
// =============================================
// Types representing database row structures (snake_case)
// These are used for mapping between database and domain models

import type { OrderStatus, SubOrderStatus, OrderItem } from './order';
import type { AddressSnapshot } from './address';
import type { PaymentStatus, PaymentMethod } from './payment';
import type { ShipmentStatus, ShipmentCarrier } from './shipment';

// Producer row types
export interface ProducerRow {
  id: string;
  user_id: string;
  business_name: string;
  abn?: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country?: string;
  bio: string;
  profile_image?: string;
  cover_image?: string;
  verification_status: string;
  badge_level: string;
  created_at: string;
  updated_at: string;
}

// Batch row types
export interface BatchRow {
  id: string;
  producer_id: string;
  region: string;
  harvest_date: string;
  extraction_date: string;
  floral_source_tags: string[];
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Variant row types
export interface VariantRow {
  id: string;
  product_id: string;
  size: string;
  price: string | number;
  stock: number;
  weight: string | number;
  barcode?: string;
}

// Product row types
export interface ProductRow {
  id: string;
  producer_id: string;
  batch_id: string;
  title: string;
  description?: string;
  photos: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProductRowWithRelations extends ProductRow {
  producer?: ProducerRow;
  batch?: BatchRow;
}

// Order database types
export interface DbOrder {
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

export interface DbSubOrder {
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

export interface DbOrderItem {
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

export interface DbPayment {
  id: string;
  order_id: string;
  stripe_checkout_session_id?: string;
  stripe_payment_intent_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DbShipment {
  id: string;
  sub_order_id: string;
  carrier?: ShipmentCarrier;
  tracking_number?: string;
  tracking_url?: string;
  status: ShipmentStatus;
  estimated_delivery?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DbShipmentEvent {
  id: string;
  shipment_id: string;
  status: string;
  description: string;
  location?: string;
  occurred_at: string;
  created_at: string;
}

// Order creation input type
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
