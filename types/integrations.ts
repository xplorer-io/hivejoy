// =============================================
// Integration Types
// =============================================
// Types for third-party service integrations

// Stripe checkout types
export type CheckoutItemSnapshot = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type CheckoutSnapshot = {
  nonce: string;
  customerEmail: string;
  items: CheckoutItemSnapshot[];
  createdAt: number;
};

// SendGrid email types
export interface SellerRegistrationEmailData {
  businessName: string;
  email: string;
  abn?: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
  };
  bio: string;
  producerId: string;
  userId: string;
  // Additional comprehensive fields
  fullLegalName?: string;
  sellerType?: string;
  phoneNumber?: string;
  beekeeperRegistrationNumber?: string;
  registeringAuthority?: string;
  applicationId?: string;
}

export interface VerificationRequestEmailData {
  businessName: string;
  email: string;
  abn?: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    country: string;
  };
  bio?: string;
  producerId: string;
  userId: string;
  submissionId: string;
  documents: Array<{
    type: string;
    name: string;
    url: string;
  }>;
}

// Cloudinary upload types
export type UploadFolder = 'products' | 'producers' | 'verification' | 'batches';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}
