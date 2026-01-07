// Products
export {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getProductsByProducer,
  searchProducts,
} from './products';

// Producers
export {
  getProducers,
  getProducer,
  getProducerListings,
  getFeaturedProducers,
  getProducerStats,
} from './producers';

// Batches
export {
  getBatch,
  getBatchesByProducer,
  createBatch,
  updateBatch,
} from './batches';

// Orders
export {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getSellerOrderStats,
} from './orders';

// Auth
export {
  sendOTP,
  verifyOTP,
  getCurrentUser,
  devSwitchRole,
} from './auth';

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

