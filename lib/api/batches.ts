import type { Batch } from '@/types';
import { mockBatches } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getBatch(id: string): Promise<Batch | null> {
  await delay(200);
  return mockBatches.find(b => b.id === id) || null;
}

export async function getBatchesByProducer(producerId: string): Promise<Batch[]> {
  await delay(200);
  return mockBatches.filter(b => b.producerId === producerId);
}

export async function createBatch(data: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Batch> {
  await delay(300);
  
  const newBatch: Batch = {
    ...data,
    id: `batch-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // In real implementation, this would persist to backend
  mockBatches.push(newBatch);
  
  return newBatch;
}

export async function updateBatch(id: string, data: Partial<Batch>): Promise<Batch | null> {
  await delay(300);
  
  const index = mockBatches.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  mockBatches[index] = {
    ...mockBatches[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  return mockBatches[index];
}

