import type { ProducerProfile, Product, PaginatedResponse } from '@/types';
import { mockProducers, mockProducts } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProducers(
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedResponse<ProducerProfile>> {
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
  await delay(200);
  return mockProducers.find(p => p.id === id) || null;
}

export async function getProducerListings(producerId: string): Promise<Product[]> {
  await delay(200);
  return mockProducts.filter(
    p => p.producerId === producerId && p.status === 'approved'
  );
}

export async function getFeaturedProducers(): Promise<ProducerProfile[]> {
  await delay(200);
  return mockProducers
    .filter(p => p.verificationStatus === 'approved')
    .slice(0, 3);
}

export async function getProducerStats(producerId: string) {
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

