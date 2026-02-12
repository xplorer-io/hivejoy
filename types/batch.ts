// =============================================
// Batch Types
// =============================================

export type BatchStatus = 'draft' | 'active' | 'archived';

export interface Batch {
  id: string;
  producerId: string;
  name?: string;
  region: string;
  harvestDate: string;
  extractionDate: string;
  floralSourceTags: string[];
  quantityKg?: number;
  notes?: string;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
}
