// User roles
export type UserRole = 'consumer' | 'producer' | 'admin';

export type VerificationStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export type BatchStatus = 'draft' | 'active' | 'archived';

export type ProductStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// Base User
export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  updatedAt: string;
}

// Producer Profile
export interface ProducerProfile {
  id: string;
  userId: string;
  businessName: string;
  abn?: string;
  address: Address;
  bio: string;
  profileImage?: string;
  coverImage?: string;
  verificationStatus: VerificationStatus;
  badgeLevel: 'none' | 'verified' | 'premium';
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

// Verification
export interface VerificationSubmission {
  id: string;
  producerId: string;
  documents: VerificationDocument[];
  submittedAt: string;
  adminDecision?: 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface VerificationDocument {
  id: string;
  type: 'business_registration' | 'abn_certificate' | 'food_safety' | 'beekeeper_registration' | 'other';
  name: string;
  url: string;
  uploadedAt: string;
}

// Batch (Traceability)
export interface Batch {
  id: string;
  producerId: string;
  region: string;
  harvestDate: string;
  extractionDate: string;
  floralSourceTags: string[];
  notes?: string;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
}

// Product
export interface Product {
  id: string;
  producerId: string;
  batchId: string;
  title: string;
  description: string;
  photos: string[];
  status: ProductStatus;
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
}

// Product with relations for display
export interface ProductWithDetails extends Product {
  producer: ProducerProfile;
  batch: Batch;
}

// Order
export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  platformFee: number;
  gstTotal: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productId: string;
  productTitle: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
  gst: number;
  batchSnapshot: {
    batchId: string;
    region: string;
    harvestDate: string;
    floralSources: string[];
  };
}

// Review
export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Support
export interface SupportTicket {
  id: string;
  orderId?: string;
  userId: string;
  reason: string;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  createdAt: string;
}

// Audit
export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  entityType: string;
  entityId: string;
  action: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: string;
}

// Cart (Client-side)
export interface CartItem {
  variantId: string;
  productId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// Filter types
export interface ProductFilters {
  search?: string;
  region?: string;
  floralSource?: string;
  minPrice?: number;
  maxPrice?: number;
  producerId?: string;
  verified?: boolean;
}

export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
}

