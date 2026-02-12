// =============================================
// Component Types
// =============================================
// Types specific to React components and pages

// Dashboard stats
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

// Dispute types
export type DisputeStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Dispute {
  id: string;
  orderId: string;
  reason: string;
  status: DisputeStatus;
  createdAt: string;
  buyerEmail: string;
}

// Checkout types
export interface CheckoutItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CheckoutRequest {
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
  buyerId?: string;
}
