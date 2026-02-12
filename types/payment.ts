// =============================================
// Payment Types
// =============================================

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';

export type PaymentMethod = 'card' | 'afterpay';

export interface Payment {
  id: string;
  orderId: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}
