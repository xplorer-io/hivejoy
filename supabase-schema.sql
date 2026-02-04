-- Hive Joy Marketplace Database Schema
-- Run this in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== PROFILES ====================
-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'consumer' CHECK (role IN ('consumer', 'producer', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== PRODUCERS ====================
-- Producer Profiles
CREATE TABLE IF NOT EXISTS public.producers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  abn TEXT,
  street TEXT NOT NULL,
  suburb TEXT NOT NULL,
  state TEXT NOT NULL,
  postcode TEXT NOT NULL,
  country TEXT DEFAULT 'Australia',
  bio TEXT,
  profile_image TEXT, -- Cloudinary URL
  cover_image TEXT, -- Cloudinary URL
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected')),
  badge_level TEXT DEFAULT 'none' CHECK (badge_level IN ('none', 'verified', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== BATCHES ====================
-- Batches (Traceability)
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  harvest_date DATE NOT NULL,
  extraction_date DATE NOT NULL,
  floral_source_tags TEXT[] DEFAULT '{}',
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== PRODUCTS ====================
-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  photos TEXT[] DEFAULT '{}', -- Array of Cloudinary URLs
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  weight DECIMAL(8, 2) NOT NULL, -- in grams
  barcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ORDERS ====================
-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  gst_total DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  shipping_street TEXT NOT NULL,
  shipping_suburb TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postcode TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'Australia',
  tracking_number TEXT,
  carrier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  variant_size TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  gst DECIMAL(10, 2) DEFAULT 0,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  batch_region TEXT,
  batch_harvest_date DATE,
  batch_floral_sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== REVIEWS ====================
-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== VERIFICATION ====================
-- Verification Submissions
CREATE TABLE IF NOT EXISTS public.verification_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  admin_decision TEXT CHECK (admin_decision IN ('approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

-- Verification Documents
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES public.verification_submissions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('business_registration', 'abn_certificate', 'food_safety', 'beekeeper_registration', 'other')),
  name TEXT NOT NULL,
  url TEXT NOT NULL, -- Cloudinary URL
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SUPPORT ====================
-- Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Messages
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('consumer', 'producer', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== AUDIT ====================
-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('consumer', 'producer', 'admin')),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  before JSONB,
  after JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ROW LEVEL SECURITY ====================
-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==================== BASIC RLS POLICIES ====================
-- Drop existing policies if they exist, then create new ones
-- Profiles: Users can view and update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Producers: Users can create their own producer profile
DROP POLICY IF EXISTS "Users can create own producer profile" ON public.producers;
CREATE POLICY "Users can create own producer profile" ON public.producers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Producers: Producers can view their own profile
DROP POLICY IF EXISTS "Producers can view own profile" ON public.producers;
CREATE POLICY "Producers can view own profile" ON public.producers
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Producers can update own profile" ON public.producers;
CREATE POLICY "Producers can update own profile" ON public.producers
  FOR UPDATE USING (auth.uid() = user_id);

-- Producers: Public can view approved producers
DROP POLICY IF EXISTS "Public can view approved producers" ON public.producers;
CREATE POLICY "Public can view approved producers" ON public.producers
  FOR SELECT USING (verification_status = 'approved');

-- Products: Public can view approved products
DROP POLICY IF EXISTS "Public can view approved products" ON public.products;
CREATE POLICY "Public can view approved products" ON public.products
  FOR SELECT USING (status = 'approved');

-- Products: Producers can create their own products
DROP POLICY IF EXISTS "Producers can create own products" ON public.products;
CREATE POLICY "Producers can create own products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.producers
      WHERE producers.id = products.producer_id
      AND producers.user_id = auth.uid()
    )
  );

-- Products: Producers can manage their own products (UPDATE, DELETE)
DROP POLICY IF EXISTS "Producers can manage own products" ON public.products;
CREATE POLICY "Producers can manage own products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.producers
      WHERE producers.id = products.producer_id
      AND producers.user_id = auth.uid()
    )
  );

-- Product Variants: Public can view variants of approved products
DROP POLICY IF EXISTS "Public can view variants of approved products" ON public.product_variants;
CREATE POLICY "Public can view variants of approved products" ON public.product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_variants.product_id
      AND products.status = 'approved'
    )
  );

-- Product Variants: Producers can create variants for their own products
DROP POLICY IF EXISTS "Producers can create variants for own products" ON public.product_variants;
CREATE POLICY "Producers can create variants for own products" ON public.product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.producers ON producers.id = products.producer_id
      WHERE products.id = product_variants.product_id
      AND producers.user_id = auth.uid()
    )
  );

-- Batches: Producers can create their own batches
DROP POLICY IF EXISTS "Producers can create own batches" ON public.batches;
CREATE POLICY "Producers can create own batches" ON public.batches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.producers
      WHERE producers.id = batches.producer_id
      AND producers.user_id = auth.uid()
    )
  );

-- Batches: Producers can view their own batches
DROP POLICY IF EXISTS "Producers can view own batches" ON public.batches;
CREATE POLICY "Producers can view own batches" ON public.batches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.producers
      WHERE producers.id = batches.producer_id
      AND producers.user_id = auth.uid()
    )
  );

-- Batches: Public can view batches of approved producers
DROP POLICY IF EXISTS "Public can view batches of approved producers" ON public.batches;
CREATE POLICY "Public can view batches of approved producers" ON public.batches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.producers
      WHERE producers.id = batches.producer_id
      AND producers.verification_status = 'approved'
    )
  );

-- Orders: Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- Order Items: Users can view items of their own orders
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Reviews: Public can view reviews
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Reviews: Buyers can create reviews for their orders
DROP POLICY IF EXISTS "Buyers can create reviews" ON public.reviews;
CREATE POLICY "Buyers can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = reviews.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- Verification Submissions: Producers can view their own submissions
DROP POLICY IF EXISTS "Producers can view own verification submissions" ON public.verification_submissions;
CREATE POLICY "Producers can view own verification submissions" ON public.verification_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.producers p
      WHERE p.id = verification_submissions.producer_id
      AND p.user_id = auth.uid()
    )
  );

-- Verification Documents: Producers can view their own verification documents
DROP POLICY IF EXISTS "Producers can view own verification documents" ON public.verification_documents;
CREATE POLICY "Producers can view own verification documents" ON public.verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.verification_submissions vs
      JOIN public.producers p ON p.id = vs.producer_id
      WHERE vs.id = verification_documents.submission_id
      AND p.user_id = auth.uid()
    )
  );

-- ==================== AUTOMATIC PROFILE CREATION ====================
-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set safe search_path to prevent injection
  SET LOCAL search_path = pg_catalog, public;
  
  INSERT INTO public.profiles (id, email, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    'consumer', -- Default role
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== CREATE PROFILE FOR EXISTING USERS ====================
-- If you have existing users who signed up before this trigger was created,
-- run this to create their profiles:
INSERT INTO public.profiles (id, email, role, status)
SELECT 
  id,
  email,
  'consumer' as role,
  'active' as status
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Note: You may need to add more policies based on your specific requirements
-- For example, admin policies, verification document policies, etc.
