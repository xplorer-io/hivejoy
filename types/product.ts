// =============================================
// Product Types
// =============================================

import type { ProducerProfile } from './producer';
import type { Batch } from './batch';

export type ProductStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';

export interface NutritionalInfo {
  servingSize?: string;
  energyKj?: number;
  protein?: number;
  fatTotal?: number;
  carbohydrates?: number;
  sugars?: number;
  sodium?: number;
  [key: string]: unknown;
}

export interface Product {
  id: string;
  producerId: string;
  batchId: string;
  title: string;
  description: string;
  photos: string[];
  status: ProductStatus;
  nutritionalInfo?: NutritionalInfo;
  averageRating?: number;
  reviewCount: number;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  price: number;
  stock: number;
  weight: number;
  barcode?: string;
  sku?: string;
}

/** Product with joined relations for display */
export interface ProductWithDetails extends Product {
  producer: ProducerProfile | null;
  batch: Batch | null;
}

export interface ProductFilters {
  search?: string;
  region?: string;
  floralSource?: string;
  minPrice?: number;
  maxPrice?: number;
  producerId?: string;
  verified?: boolean;
}
