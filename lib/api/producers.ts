import type { ProducerProfile, Product, PaginatedResponse } from '@/types';
import { mockProducers, mockProducts } from './mock-data';
import {
  getProducers as dbGetProducers,
  getProducer as dbGetProducer,
  getFeaturedProducers as dbGetFeaturedProducers,
  getProductsByProducer as dbGetProductsByProducer,
} from './database';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if the Supabase service role key is configured.
 * If not, fall back to mock data.
 */
function isDbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getProducers(
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedResponse<ProducerProfile>> {
  if (isDbConfigured()) {
    return dbGetProducers(page, pageSize);
  }

  // Fallback: mock data
  await delay(300);

  const verified = mockProducers.filter(p => p.verificationStatus === 'approved');
  const total = verified.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paged = verified.slice(start, start + pageSize);

  return {
    data: paged,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getProducer(id: string): Promise<ProducerProfile | null> {
  if (isDbConfigured()) {
    return dbGetProducer(id);
  }

  // Fallback: mock data
  await delay(200);
  return mockProducers.find(p => p.id === id) || null;
}

export async function getProducerListings(producerId: string): Promise<Product[]> {
  if (isDbConfigured()) {
    return dbGetProductsByProducer(producerId);
  }

  // Fallback: mock data
  await delay(200);
  return mockProducts.filter(
    p => p.producerId === producerId && p.status === 'approved'
  );
}

export async function getFeaturedProducers(): Promise<ProducerProfile[]> {
  if (isDbConfigured()) {
    const featured = await dbGetFeaturedProducers();
    return featured.slice(0, 3);
  }

  // Fallback: mock data
  await delay(200);
  return mockProducers
    .filter(p => p.verificationStatus === 'approved')
    .slice(0, 3);
}

export async function getProducerStats(producerId: string) {
  if (isDbConfigured()) {
    try {
      const products = await dbGetProductsByProducer(producerId, true); // Include all statuses
      const totalProducts = products.length;
      const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
      
      // TODO: Query actual orders and reviews from database when those tables are available
      return {
        totalProducts,
        totalVariants,
        totalOrders: 0, // Placeholder until orders table is queried
        averageRating: 0, // Placeholder until reviews table is queried
        totalReviews: 0, // Placeholder until reviews table is queried
      };
    } catch (error) {
      console.error('Error fetching producer stats from database:', error);
      // Fall through to mock data
    }
  }

  // Fallback: mock data
  await delay(150);
  
  const products = mockProducts.filter(p => p.producerId === producerId);
  const totalProducts = products.length;
  const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
  
  return {
    totalProducts,
    totalVariants,
    totalOrders: Math.floor(Math.random() * 100) + 10,
    averageRating: 4.5 + Math.random() * 0.5,
    totalReviews: Math.floor(Math.random() * 50) + 5,
  };
}

