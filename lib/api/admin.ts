import type { VerificationSubmission, Product, ProducerProfile } from '@/types';
import { mockVerifications, mockProducers, mockProducts } from './mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Verification Queue
export async function getVerificationQueue(): Promise<VerificationSubmission[]> {
  await delay(300);
  return mockVerifications.filter(v => !v.adminDecision);
}

export async function getVerification(id: string): Promise<{
  submission: VerificationSubmission;
  producer: ProducerProfile;
} | null> {
  await delay(200);
  
  const submission = mockVerifications.find(v => v.id === id);
  if (!submission) return null;
  
  const producer = mockProducers.find(p => p.id === submission.producerId);
  if (!producer) return null;
  
  return { submission, producer };
}

export async function approveVerification(
  id: string,
  adminId: string,
  notes?: string
): Promise<VerificationSubmission | null> {
  await delay(500);
  
  const index = mockVerifications.findIndex(v => v.id === id);
  if (index === -1) return null;
  
  mockVerifications[index] = {
    ...mockVerifications[index],
    adminDecision: 'approved',
    adminNotes: notes,
    reviewedBy: adminId,
    reviewedAt: new Date().toISOString(),
  };
  
  // Update producer status
  const producerIndex = mockProducers.findIndex(
    p => p.id === mockVerifications[index].producerId
  );
  if (producerIndex !== -1) {
    mockProducers[producerIndex].verificationStatus = 'approved';
    mockProducers[producerIndex].badgeLevel = 'verified';
  }
  
  return mockVerifications[index];
}

export async function rejectVerification(
  id: string,
  adminId: string,
  notes: string
): Promise<VerificationSubmission | null> {
  await delay(500);
  
  const index = mockVerifications.findIndex(v => v.id === id);
  if (index === -1) return null;
  
  mockVerifications[index] = {
    ...mockVerifications[index],
    adminDecision: 'rejected',
    adminNotes: notes,
    reviewedBy: adminId,
    reviewedAt: new Date().toISOString(),
  };
  
  // Update producer status
  const producerIndex = mockProducers.findIndex(
    p => p.id === mockVerifications[index].producerId
  );
  if (producerIndex !== -1) {
    mockProducers[producerIndex].verificationStatus = 'rejected';
  }
  
  return mockVerifications[index];
}

// Listing Moderation
export async function getPendingListings(): Promise<Product[]> {
  await delay(300);
  return mockProducts.filter(p => p.status === 'pending_approval');
}

export async function approveListing(productId: string): Promise<Product | null> {
  await delay(300);
  
  const index = mockProducts.findIndex(p => p.id === productId);
  if (index === -1) return null;
  
  mockProducts[index].status = 'approved';
  mockProducts[index].updatedAt = new Date().toISOString();
  
  return mockProducts[index];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function rejectListing(productId: string, _reason: string): Promise<Product | null> {
  await delay(300);
  
  const index = mockProducts.findIndex(p => p.id === productId);
  if (index === -1) return null;
  
  mockProducts[index].status = 'rejected';
  mockProducts[index].updatedAt = new Date().toISOString();
  
  return mockProducts[index];
}

// Dashboard Stats
export async function getAdminStats() {
  await delay(300);
  
  return {
    totalProducers: mockProducers.length,
    verifiedProducers: mockProducers.filter(p => p.verificationStatus === 'approved').length,
    pendingVerifications: mockVerifications.filter(v => !v.adminDecision).length,
    totalProducts: mockProducts.length,
    pendingListings: mockProducts.filter(p => p.status === 'pending_approval').length,
    // Mock GMV and order stats
    gmv: 12450.00,
    totalOrders: 156,
    averageOrderValue: 79.81,
    repeatBuyerRate: 0.35,
  };
}

