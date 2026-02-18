// Products - Use database functions instead of mock data
export {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getProductsByProducer,
  searchProducts,
} from './database';

// Producers - Use database functions instead of mock data
export {
  getProducers,
  getProducer,
  getFeaturedProducers,
  getProducerByUserId,
} from './database';

// Producer listings - use database
export { getProductsByProducer as getProducerListings } from './database';

// Producer stats - keep mock for now (or implement in database)
export { getProducerStats } from './producers';

// Batches
// Note: getBatchesByProducer and createBatch are server-side only
// Client components should use API endpoints: /api/batches and /api/batches/create
// Keeping mock versions here for backward compatibility, but prefer API endpoints
export { getBatch, updateBatch } from './batches';

// Orders
export {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getSellerOrderStats,
} from './orders';

// Auth - Client-only, import directly from './auth' in client components
// Not exported here to avoid server/client boundary issues

// Admin
export {
  getVerificationQueue,
  getVerification,
  approveVerification,
  rejectVerification,
  getPendingListings,
  approveListing,
  rejectListing,
  getAdminStats,
} from './admin';

// Mock data (for reference)
export { floralSourceOptions, australianRegions } from './mock-data';

