// =============================================
// Cart Types
// =============================================

import type { Product, ProductVariant } from './product';

export interface CartItem {
  variantId: string;
  productId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}
