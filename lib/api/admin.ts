import type { VerificationSubmission, Product, ProducerProfile } from '@/types';
import { mockVerifications, mockProducers, mockProducts } from './mock-data';
import { getProduct, getProductsByProducer } from './database';
import { createClient } from '@/lib/supabase/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if the Supabase service role key is configured.
 * If not, fall back to mock data.
 */
function isDbConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Verification Queue
export async function getVerificationQueue(): Promise<VerificationSubmission[]> {
  await delay(300);
  return mockVerifications.filter(v => v.status === 'submitted' || v.status === 'pending');
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
    status: 'approved',
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
    status: 'rejected',
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
  if (isDbConfigured()) {
    try {
      const supabase = await createClient();
      
      // Get all products with pending_approval status
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending listings:', error);
        // Fall through to mock data
      } else if (Array.isArray(data) && data.length > 0) {
        // Get variants for all products
        const productIds = data.map((p: { id: string }) => p.id);
        const { data: variants } = await supabase
          .from('product_variants')
          .select('*')
          .in('product_id', productIds);

        const variantsArray = Array.isArray(variants) ? variants : [];
        const variantsByProduct = variantsArray.reduce((acc: Record<string, typeof variantsArray>, v: { product_id: string }) => {
          if (!acc[v.product_id]) acc[v.product_id] = [];
          acc[v.product_id].push(v);
          return acc;
        }, {});

        // Map to Product type (simplified - would need full mapping function)
        return (data as any[]).map((row: any) => ({
          id: row.id,
          producerId: row.producer_id,
          batchId: row.batch_id,
          title: row.title,
          description: row.description,
          photos: row.photos || [],
          status: row.status,
          nutritionalInfo: row.nutritional_info,
          averageRating: row.average_rating,
          reviewCount: row.review_count || 0,
          variants: (variantsByProduct[row.id] || []).map((v: any) => ({
            id: v.id,
            productId: v.product_id,
            size: v.size,
            price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
            stock: v.stock,
            weight: typeof v.weight === 'string' ? parseFloat(v.weight) : v.weight,
            barcode: v.barcode,
          })),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
    } catch (error) {
      console.error('Error fetching pending listings:', error);
      // Fall through to mock data
    }
  }

  // Fallback: mock data
  await delay(300);
  return mockProducts.filter(p => p.status === 'pending_approval');
}

export async function approveListing(productId: string): Promise<Product | null> {
  if (isDbConfigured()) {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('products')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (error || !data) {
        console.error('Error approving listing:', error);
        return null;
      }

      // Fetch the updated product with variants
      const updatedProduct = await getProduct(productId);
      return updatedProduct || null;
    } catch (error) {
      console.error('Error approving listing:', error);
      return null;
    }
  }

  // Fallback: mock data
  await delay(300);
  
  const index = mockProducts.findIndex(p => p.id === productId);
  if (index === -1) return null;
  
  mockProducts[index].status = 'approved';
  mockProducts[index].updatedAt = new Date().toISOString();
  
  return mockProducts[index];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function rejectListing(productId: string, _reason: string): Promise<Product | null> {
  if (isDbConfigured()) {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('products')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (error || !data) {
        console.error('Error rejecting listing:', error);
        return null;
      }

      // Fetch the updated product with variants
      const updatedProduct = await getProduct(productId);
      return updatedProduct || null;
    } catch (error) {
      console.error('Error rejecting listing:', error);
      return null;
    }
  }

  // Fallback: mock data
  await delay(300);
  
  const index = mockProducts.findIndex(p => p.id === productId);
  if (index === -1) return null;
  
  mockProducts[index].status = 'rejected';
  mockProducts[index].updatedAt = new Date().toISOString();
  
  return mockProducts[index];
}

// Dashboard Stats
export async function getAdminStats() {
  if (isDbConfigured()) {
    try {
      const supabase = await createClient();
      
      // Get producer counts
      const { count: totalProducers } = await supabase
        .from('producers')
        .select('*', { count: 'exact', head: true });

      const { count: verifiedProducers } = await supabase
        .from('producers')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'approved');

      const { count: pendingVerifications } = await supabase
        .from('producers')
        .select('*', { count: 'exact', head: true })
        .in('application_status', ['pending_review', 'changes_requested']);

      // Get product counts
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: pendingListings } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_approval');

      // TODO: Query actual order stats from orders table when available
      return {
        totalProducers: totalProducers || 0,
        verifiedProducers: verifiedProducers || 0,
        pendingVerifications: pendingVerifications || 0,
        totalProducts: totalProducts || 0,
        pendingListings: pendingListings || 0,
        // Placeholder until orders table is queried
        gmv: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        repeatBuyerRate: 0,
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Fall through to mock data
    }
  }

  // Fallback: mock data
  await delay(300);
  
  return {
    totalProducers: mockProducers.length,
    verifiedProducers: mockProducers.filter(p => p.verificationStatus === 'approved').length,
    pendingVerifications: mockVerifications.filter(v => v.status === 'submitted' || v.status === 'pending').length,
    totalProducts: mockProducts.length,
    pendingListings: mockProducts.filter(p => p.status === 'pending_approval').length,
    // Mock GMV and order stats
    gmv: 12450.00,
    totalOrders: 156,
    averageOrderValue: 79.81,
    repeatBuyerRate: 0.35,
  };
}
