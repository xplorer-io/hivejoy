// =============================================
// Review Types
// =============================================

export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}
