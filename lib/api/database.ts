import { createClient } from '@/lib/supabase/server';
import type {
  ProducerProfile,
  Product,
  ProductWithDetails,
  Batch,
  ProductVariant,
  Address,
  ProductFilters,
  PaginatedResponse,
} from '@/types';

// Database row types
interface ProducerRow {
  id: string;
  user_id: string;
  business_name: string;
  abn?: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country?: string;
  bio: string;
  profile_image?: string;
  cover_image?: string;
  verification_status: string;
  badge_level: string;
  created_at: string;
  updated_at: string;
}

interface BatchRow {
  id: string;
  producer_id: string;
  region: string;
  harvest_date: string;
  extraction_date: string;
  floral_source_tags: string[];
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface VariantRow {
  id: string;
  product_id: string;
  size: string;
  price: string | number;
  stock: number;
  weight: string | number;
  barcode?: string;
}

interface ProductRow {
  id: string;
  producer_id: string;
  batch_id: string;
  title: string;
  description?: string;
  photos: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProductRowWithRelations extends ProductRow {
  producer?: ProducerRow;
  batch?: BatchRow;
}

// Helper to convert database row to ProducerProfile
function mapProducer(row: ProducerRow): ProducerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    abn: row.abn,
    address: {
      street: row.street,
      suburb: row.suburb,
      state: row.state,
      postcode: row.postcode,
      country: row.country || 'Australia',
    },
    bio: row.bio,
    profileImage: row.profile_image,
    coverImage: row.cover_image,
    verificationStatus: row.verification_status as ProducerProfile['verificationStatus'],
    badgeLevel: row.badge_level as ProducerProfile['badgeLevel'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper to convert database row to Batch
function mapBatch(row: BatchRow): Batch {
  return {
    id: row.id,
    producerId: row.producer_id,
    region: row.region,
    harvestDate: row.harvest_date,
    extractionDate: row.extraction_date,
    floralSourceTags: row.floral_source_tags || [],
    notes: row.notes,
    status: row.status as Batch['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper to convert database row to ProductVariant
function mapVariant(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    size: row.size,
    price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
    stock: row.stock,
    weight: typeof row.weight === 'string' ? parseFloat(row.weight) : row.weight,
    barcode: row.barcode,
  };
}

// Helper to convert database row to Product
function mapProduct(row: ProductRow, variants: ProductVariant[] = []): Product {
  return {
    id: row.id,
    producerId: row.producer_id,
    batchId: row.batch_id,
    title: row.title,
    description: row.description || '',
    photos: row.photos || [],
    status: row.status as Product['status'],
    variants,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== PRODUCERS ====================

/**
 * Get all approved producers with pagination
 */
export async function getProducers(
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedResponse<ProducerProfile>> {
  const supabase = await createClient();
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('producers')
    .select('*', { count: 'exact' })
    .eq('verification_status', 'approved')
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching producers:', error);
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const producerData = Array.isArray(data) ? data : [];
  return {
    data: producerData.map(mapProducer),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Get producer by ID
 */
export async function getProducer(id: string): Promise<ProducerProfile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('producers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapProducer(data);
}

/**
 * Get featured producers (top 3)
 */
export async function getFeaturedProducers(): Promise<ProducerProfile[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('producers')
    .select('*')
    .eq('verification_status', 'approved')
    .eq('badge_level', 'premium')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching featured producers:', error);
    return [];
  }

  return Array.isArray(data) ? data.map(mapProducer) : [];
}

// ==================== BATCHES ====================

/**
 * Get batch by ID
 */
export async function getBatch(id: string): Promise<Batch | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapBatch(data);
}

/**
 * Get batches by producer ID
 */
export async function getBatchesByProducer(producerId: string): Promise<Batch[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('producer_id', producerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching batches:', error);
    return [];
  }

  return Array.isArray(data) ? data.map(mapBatch) : [];
}

// ==================== PRODUCTS ====================

/**
 * Get all approved products with filters and pagination
 */
export async function getProducts(
  filters?: ProductFilters,
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedResponse<ProductWithDetails>> {
  const supabase = await createClient();
  
  let query = supabase
    .from('products')
    .select(`
      *,
      producer:producers(*),
      batch:batches(*)
    `)
    .eq('status', 'approved');

  // Apply filters
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.producerId) {
    query = query.eq('producer_id', filters.producerId);
  }

  if (filters?.verified) {
    query = query.eq('producer.badge_level', 'verified');
  }

  // Get total count
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  // Apply pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  query = query.range(start, end).order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  // Get variants for all products
  const productData = Array.isArray(data) ? data : [];
  const productIds = productData.map((p: ProductRowWithRelations) => p.id);
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .in('product_id', productIds);

  // Group variants by product_id
  const variantsArray = Array.isArray(variants) ? variants : [];
  const variantsByProduct = variantsArray.reduce((acc: Record<string, ProductVariant[]>, v: VariantRow) => {
    if (!acc[v.product_id]) acc[v.product_id] = [];
    acc[v.product_id].push(mapVariant(v));
    return acc;
  }, {});

  // Map to ProductWithDetails
  const products: ProductWithDetails[] = productData.map((row: ProductRowWithRelations) => {
    const product = mapProduct(row, variantsByProduct[row.id] || []);
    return {
      ...product,
      producer: mapProducer(row.producer!),
      batch: mapBatch(row.batch!),
    };
  });

  // Apply additional filters that require batch data
  let filtered = products;

  if (filters?.region) {
    filtered = filtered.filter((p) =>
      p.batch.region.toLowerCase().includes(filters.region!.toLowerCase())
    );
  }

  if (filters?.floralSource) {
    filtered = filtered.filter((p) =>
      p.batch.floralSourceTags.some((tag) =>
        tag.toLowerCase().includes(filters.floralSource!.toLowerCase())
      )
    );
  }

  if (filters?.minPrice !== undefined) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => v.price >= filters.minPrice!)
    );
  }

  if (filters?.maxPrice !== undefined) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => v.price <= filters.maxPrice!)
    );
  }

  return {
    data: filtered,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Get product by ID with full details
 */
export async function getProduct(id: string): Promise<ProductWithDetails | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      producer:producers(*),
      batch:batches(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  // Get variants
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id);

  const variantsArray = Array.isArray(variants) ? variants : [];
  const product = mapProduct(data, variantsArray.map(mapVariant));

  return {
    ...product,
    producer: mapProducer(data.producer),
    batch: mapBatch(data.batch),
  };
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      producer:producers(*),
      batch:batches(*)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  const productData = Array.isArray(data) ? data : [];
  const productIds = productData.map((p: ProductRowWithRelations) => p.id);
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .in('product_id', productIds);

  const variantsArray = Array.isArray(variants) ? variants : [];
  const variantsByProduct = variantsArray.reduce((acc: Record<string, ProductVariant[]>, v: VariantRow) => {
    if (!acc[v.product_id]) acc[v.product_id] = [];
    acc[v.product_id].push(mapVariant(v));
    return acc;
  }, {});

  return productData.map((row: ProductRowWithRelations) => {
    const product = mapProduct(row, variantsByProduct[row.id] || []);
    return {
      ...product,
      producer: mapProducer(row.producer!),
      batch: mapBatch(row.batch!),
    };
  });
}

/**
 * Get products by producer ID
 */
export async function getProductsByProducer(producerId: string): Promise<Product[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('producer_id', producerId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching producer products:', error);
    return [];
  }

  const productData = Array.isArray(data) ? data : [];
  const productIds = productData.map((p: ProductRow) => p.id);
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .in('product_id', productIds);

  const variantsArray = Array.isArray(variants) ? variants : [];
  const variantsByProduct = variantsArray.reduce((acc: Record<string, ProductVariant[]>, v: VariantRow) => {
    if (!acc[v.product_id]) acc[v.product_id] = [];
    acc[v.product_id].push(mapVariant(v));
    return acc;
  }, {});

  return productData.map((row: ProductRow) => mapProduct(row, variantsByProduct[row.id] || []));
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      producer:producers(*),
      batch:batches(*)
    `)
    .eq('status', 'approved')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  const productData = Array.isArray(data) ? data : [];
  const productIds = productData.map((p: ProductRowWithRelations) => p.id);
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .in('product_id', productIds);

  const variantsArray = Array.isArray(variants) ? variants : [];
  const variantsByProduct = variantsArray.reduce((acc: Record<string, ProductVariant[]>, v: VariantRow) => {
    if (!acc[v.product_id]) acc[v.product_id] = [];
    acc[v.product_id].push(mapVariant(v));
    return acc;
  }, {});

  return productData.map((row: ProductRowWithRelations) => {
    const product = mapProduct(row, variantsByProduct[row.id] || []);
    return {
      ...product,
      producer: mapProducer(row.producer!),
      batch: mapBatch(row.batch!),
    };
  });
}

/**
 * Create a new product (with Cloudinary image URLs)
 */
export async function createProduct(
  productData: {
    producerId: string;
    batchId: string;
    title: string;
    description: string;
    photos: string[]; // Cloudinary URLs
    variants: Omit<ProductVariant, 'id' | 'productId'>[];
  }
): Promise<Product> {
  const supabase = await createClient();

  // Insert product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      producer_id: productData.producerId,
      batch_id: productData.batchId,
      title: productData.title,
      description: productData.description,
      photos: productData.photos,
      status: 'pending_approval',
    })
    .select()
    .single();

  if (productError) {
    throw new Error(`Failed to create product: ${productError.message}`);
  }

  // Insert variants
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .insert(
      productData.variants.map((v) => ({
        product_id: product.id,
        size: v.size,
        price: v.price,
        stock: v.stock,
        weight: v.weight,
        barcode: v.barcode,
      }))
    )
    .select();

  if (variantsError) {
    // Rollback: delete the product if variants fail
    await supabase.from('products').delete().eq('id', product.id);
    throw new Error(`Failed to create variants: ${variantsError.message}`);
  }

  const variantsArray = Array.isArray(variants) ? variants : [];
  return mapProduct(product, variantsArray.map(mapVariant));
}

/**
 * Create a new producer profile
 */
export async function createProducer(
  producerData: {
    userId: string;
    businessName: string;
    abn?: string;
    address: Address;
    bio: string;
    profileImage?: string; // Cloudinary URL
    coverImage?: string; // Cloudinary URL
  }
): Promise<ProducerProfile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('producers')
    .insert({
      user_id: producerData.userId,
      business_name: producerData.businessName,
      abn: producerData.abn,
      street: producerData.address.street,
      suburb: producerData.address.suburb,
      state: producerData.address.state,
      postcode: producerData.address.postcode,
      country: producerData.address.country || 'Australia',
      bio: producerData.bio,
      profile_image: producerData.profileImage,
      cover_image: producerData.coverImage,
      verification_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create producer: ${error.message}`);
  }

  return mapProducer(data);
}

/**
 * Create a new batch
 */
export async function createBatch(
  batchData: {
    producerId: string;
    region: string;
    harvestDate: string;
    extractionDate: string;
    floralSourceTags: string[];
    notes?: string;
  }
): Promise<Batch> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('batches')
    .insert({
      producer_id: batchData.producerId,
      region: batchData.region,
      harvest_date: batchData.harvestDate,
      extraction_date: batchData.extractionDate,
      floral_source_tags: batchData.floralSourceTags,
      notes: batchData.notes,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create batch: ${error.message}`);
  }

  return mapBatch(data);
}
