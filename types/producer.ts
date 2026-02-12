// =============================================
// Producer Types
// =============================================

import type { AddressSnapshot } from './address';

export type VerificationStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface ProducerProfile {
  id: string;
  userId: string;
  businessName: string;
  abn?: string;
  address: AddressSnapshot;
  bio: string;
  profileImage?: string;
  coverImage?: string;
  verificationStatus: VerificationStatus;
  badgeLevel: 'none' | 'verified' | 'premium';
  createdAt: string;
  updatedAt: string;
}

export interface VerificationSubmission {
  id: string;
  producerId: string;
  status: VerificationStatus;
  documents: VerificationDocument[];
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
  createdAt: string;
}

export interface VerificationDocument {
  id: string;
  submissionId: string;
  type: 'business_registration' | 'abn_certificate' | 'food_safety' | 'beekeeper_registration' | 'other';
  name: string;
  url: string;
  uploadedAt: string;
}
