// =============================================
// Status & Enum Types
// =============================================

export type UserRole = 'consumer' | 'producer' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'banned';

export type VerificationStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export type BatchStatus = 'draft' | 'active' | 'archived';

export type ProductStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'archived';

export type OrderStatus = 'pending' | 'confirmed' | 'partially_shipped' | 'shipped' | 'delivered' | 'cancelled';

export type SubOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';

export type PaymentMethod = 'card' | 'afterpay';

export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export type ShipmentCarrier = 'australia_post' | 'shippit' | 'sendle' | 'other';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// =============================================
// User
// =============================================

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// Address
// =============================================

/** Saved address entity (stored in DB, one user can have many) */
export interface Address {
  id: string;
  userId: string;
  label: 'home' | 'work' | 'other';
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

/** Immutable address snapshot embedded in orders and profiles */
export interface AddressSnapshot {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

// =============================================
// Producer Profile
// =============================================

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

// =============================================
// Verification
// =============================================

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

// =============================================
// Batch (Traceability)
// =============================================

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

// =============================================
// Product
// =============================================

export interface NutritionalInfo {
  servingSize?: string;
  energyKj?: number;
  protein?: number;
  fatTotal?: number;
  carbohydrates?: number;
  sugars?: number;
  sodium?: number;
  [key: string]: unknown;
}

export interface Product {
  id: string;
  producerId: string;
  batchId: string;
  title: string;
  description: string;
  photos: string[];
  status: ProductStatus;
  nutritionalInfo?: NutritionalInfo;
  averageRating?: number;
  reviewCount: number;
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
  sku?: string;
}

/** Product with joined relations for display */
export interface ProductWithDetails extends Product {
  producer: ProducerProfile | null;
  batch: Batch | null;
}

// =============================================
// Order (Parent - one per checkout)
// =============================================

export interface Order {
  id: string;
  buyerId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingTotal: number;
  platformFeeTotal: number;
  gstTotal: number;
  total: number;
  shippingAddress: AddressSnapshot;
  billingAddress?: AddressSnapshot;
  subOrders: SubOrder[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// SubOrder (one per seller within an order)
// =============================================

export interface SubOrder {
  id: string;
  orderId: string;
  sellerId: string;
  status: SubOrderStatus;
  subtotal: number;
  shippingCost: number;
  platformFee: number;
  gst: number;
  total: number;
  items: OrderItem[];
  shipment?: Shipment;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// Order Item
// =============================================

export interface OrderItem {
  id: string;
  subOrderId: string;
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

// =============================================
// Payment
// =============================================

export interface Payment {
  id: string;
  orderId: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// Shipment
// =============================================

export interface Shipment {
  id: string;
  subOrderId: string;
  carrier?: ShipmentCarrier;
  trackingNumber?: string;
  trackingUrl?: string;
  status: ShipmentStatus;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  events: ShipmentEvent[];
  createdAt: string;
  updatedAt: string;
}

// =============================================
// Shipment Event
// =============================================

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: string;
  description: string;
  location?: string;
  occurredAt: string;
  createdAt: string;
}

// =============================================
// Review
// =============================================

export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

// =============================================
// Support
// =============================================

export interface SupportTicket {
  id: string;
  orderId?: string;
  subOrderId?: string;
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

// =============================================
// Audit
// =============================================

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  entityType: string;
  entityId: string;
  action: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  createdAt: string;
}

// =============================================
// Cart (Client-side only)
// =============================================

export interface CartItem {
  variantId: string;
  productId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

// =============================================
// API Response types
// =============================================

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

// =============================================
// Filter types
// =============================================

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
  status?: OrderStatus | SubOrderStatus;
  dateFrom?: string;
  dateTo?: string;
}
