// =============================================
// Shipment Types
// =============================================

export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export type ShipmentCarrier = 'australia_post' | 'shippit' | 'sendle' | 'other';

export interface Shipment {
  id: string;
  subOrderId: string;
  carrier?: ShipmentCarrier;
  trackingNumber?: string;
  trackingUrl?: string;
  status: ShipmentStatus;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  events: ShipmentEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: string;
  description: string;
  location?: string;
  occurredAt: string;
  createdAt: string;
}
