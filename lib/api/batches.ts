import type { Batch } from '@/types';
import { mockBatches } from './mock-data';
import {
  getBatch as dbGetBatch,
  getBatchesByProducer as dbGetBatchesByProducer,
  createBatch as dbCreateBatch,
} from './database';
import { createClient } from '@/lib/supabase/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if the Supabase service role key is configured.
 * If not, fall back to mock data.
 */
function isDbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function getBatch(id: string): Promise<Batch | null> {
  if (isDbConfigured()) {
    return dbGetBatch(id);
  }

  // Fallback: mock data
  await delay(200);
  return mockBatches.find(b => b.id === id) || null;
}

export async function getBatchesByProducer(producerId: string): Promise<Batch[]> {
  if (isDbConfigured()) {
    return dbGetBatchesByProducer(producerId);
  }

  // Fallback: mock data
  await delay(200);
  return mockBatches.filter(b => b.producerId === producerId);
}

export async function createBatch(data: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Batch> {
  if (isDbConfigured()) {
    return dbCreateBatch({
      producerId: data.producerId,
      region: data.region,
      harvestDate: data.harvestDate,
      extractionDate: data.extractionDate,
      floralSourceTags: data.floralSourceTags,
      notes: data.notes,
    });
  }

  // Fallback: mock data
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
  if (isDbConfigured()) {
    try {
      const supabase = await createClient();
      
      // Map Batch fields to database column names
      const updateData: Record<string, unknown> = {};
      if (data.region !== undefined) updateData.region = data.region;
      if (data.harvestDate !== undefined) updateData.harvest_date = data.harvestDate;
      if (data.extractionDate !== undefined) updateData.extraction_date = data.extractionDate;
      if (data.floralSourceTags !== undefined) updateData.floral_source_tags = data.floralSourceTags;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.status !== undefined) updateData.status = data.status;
      updateData.updated_at = new Date().toISOString();

      const { data: updated, error } = await supabase
        .from('batches')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !updated) {
        console.error('Error updating batch:', error);
        return null;
      }

      // Map database row to Batch type
      return {
        id: updated.id,
        producerId: updated.producer_id,
        region: updated.region,
        harvestDate: updated.harvest_date,
        extractionDate: updated.extraction_date,
        floralSourceTags: updated.floral_source_tags || [],
        notes: updated.notes,
        status: updated.status as Batch['status'],
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };
    } catch (error) {
      console.error('Error updating batch:', error);
      return null;
    }
  }

  // Fallback: mock data
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

