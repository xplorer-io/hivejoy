import type { Product, ProductWithDetails, ProductFilters, PaginatedResponse } from '@/types';
import { mockProducts, mockProducers, mockBatches } from './mock-data';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProducts(
  filters?: ProductFilters,
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedResponse<ProductWithDetails>> {
  await delay(300);

  let filtered = mockProducts.filter(p => p.status === 'approved');

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      p =>
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
    );
  }

  if (filters?.region) {
    const batchIds = mockBatches
      .filter(b => b.region.toLowerCase().includes(filters.region!.toLowerCase()))
      .map(b => b.id);
    filtered = filtered.filter(p => batchIds.includes(p.batchId));
  }

  if (filters?.floralSource) {
    const batchIds = mockBatches
      .filter(b => b.floralSourceTags.some(tag => 
        tag.toLowerCase().includes(filters.floralSource!.toLowerCase())
      ))
      .map(b => b.id);
    filtered = filtered.filter(p => batchIds.includes(p.batchId));
  }

  if (filters?.minPrice !== undefined) {
    filtered = filtered.filter(p =>
      p.variants.some(v => v.price >= filters.minPrice!)
    );
  }

  if (filters?.maxPrice !== undefined) {
    filtered = filtered.filter(p =>
      p.variants.some(v => v.price <= filters.maxPrice!)
    );
  }

  if (filters?.producerId) {
    filtered = filtered.filter(p => p.producerId === filters.producerId);
  }

  if (filters?.verified) {
    const verifiedProducerIds = mockProducers
      .filter(p => p.badgeLevel !== 'none')
      .map(p => p.id);
    filtered = filtered.filter(p => verifiedProducerIds.includes(p.producerId));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  const withDetails: ProductWithDetails[] = paged.map(product => ({
    ...product,
    producer: mockProducers.find(p => p.id === product.producerId)!,
    batch: mockBatches.find(b => b.id === product.batchId)!,
  }));

  return {
    data: withDetails,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getProduct(id: string): Promise<ProductWithDetails | null> {
  await delay(200);

  const product = mockProducts.find(p => p.id === id);
  if (!product) return null;

  return {
    ...product,
    producer: mockProducers.find(p => p.id === product.producerId)!,
    batch: mockBatches.find(b => b.id === product.batchId)!,
  };
}

export async function getFeaturedProducts(): Promise<ProductWithDetails[]> {
  await delay(200);

  const featured = mockProducts
    .filter(p => p.status === 'approved')
    .slice(0, 4);

  return featured.map(product => ({
    ...product,
    producer: mockProducers.find(p => p.id === product.producerId)!,
    batch: mockBatches.find(b => b.id === product.batchId)!,
  }));
}

export async function getProductsByProducer(producerId: string): Promise<Product[]> {
  await delay(200);
  return mockProducts.filter(p => p.producerId === producerId && p.status === 'approved');
}

export async function searchProducts(query: string): Promise<ProductWithDetails[]> {
  await delay(150);

  const search = query.toLowerCase();
  const results = mockProducts
    .filter(p => p.status === 'approved')
    .filter(
      p =>
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
    )
    .slice(0, 10);

  return results.map(product => ({
    ...product,
    producer: mockProducers.find(p => p.id === product.producerId)!,
    batch: mockBatches.find(b => b.id === product.batchId)!,
  }));
}

