-- =============================================================
-- Hive Joy Marketplace - Seed Data
-- =============================================================
-- Deterministic UUIDs for easy reference across tables
-- =============================================================

-- =============================================================
-- Users
-- =============================================================

INSERT INTO users (id, email, phone, first_name, last_name, role, status, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'buyer@example.com', '0412345678', 'James', 'Wilson', 'consumer', 'active', '2025-01-01T00:00:00Z', '2025-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000002', 'producer@goldenhive.com.au', '0423456789', 'Sarah', 'Mitchell', 'producer', 'active', '2024-06-15T00:00:00Z', '2025-01-05T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000003', 'producer@sunnymeadows.com.au', NULL, 'Tom', 'Clarke', 'producer', 'active', '2024-08-20T00:00:00Z', '2025-01-03T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000004', 'admin@hivejoy.com.au', NULL, 'Admin', 'User', 'admin', 'active', '2024-01-01T00:00:00Z', '2025-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000005', 'producer@tasmaniapure.com.au', NULL, 'Emily', 'Brooks', 'producer', 'active', '2025-01-02T00:00:00Z', '2025-01-02T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000006', 'reviewer1@example.com', NULL, 'Reviewer', 'One', 'consumer', 'active', '2024-11-01T00:00:00Z', '2024-11-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000007', 'reviewer2@example.com', NULL, 'Reviewer', 'Two', 'consumer', 'active', '2024-11-01T00:00:00Z', '2024-11-01T00:00:00Z');

-- =============================================================
-- Addresses
-- =============================================================

INSERT INTO addresses (id, user_id, label, street, suburb, state, postcode, country, is_default) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'home', '10 Sample Street', 'Melbourne', 'VIC', '3000', 'Australia', true);

-- =============================================================
-- Producers (formerly Producer Profiles)
-- =============================================================

INSERT INTO producers (id, user_id, business_name, abn, address, bio, profile_image, cover_image, verification_status, badge_level, created_at, updated_at) VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Golden Hive Apiaries',
    '12345678901',
    '{"street": "123 Honey Lane", "suburb": "Beechworth", "state": "VIC", "postcode": "3747", "country": "Australia"}',
    'Family-owned apiary in the heart of Victorian high country. We''ve been producing premium raw honey for over 30 years, using traditional beekeeping methods passed down through generations. Our bees forage on pristine native bushland.',
    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400',
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200',
    'approved',
    'verified',
    '2024-06-15T00:00:00Z',
    '2025-01-05T00:00:00Z'
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'Sunny Meadows Honey',
    '98765432101',
    '{"street": "456 Blossom Road", "suburb": "Mudgee", "state": "NSW", "postcode": "2850", "country": "Australia"}',
    'Boutique honey producer specializing in single-origin wildflower and eucalyptus varieties. Our hives are located in protected bushland areas, producing honey with unique terroir.',
    'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200',
    'approved',
    'premium',
    '2024-08-20T00:00:00Z',
    '2025-01-03T00:00:00Z'
  ),
  (
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0000-000000000005',
    'Tasmania Pure Honey',
    NULL,
    '{"street": "78 Wilderness Way", "suburb": "Huonville", "state": "TAS", "postcode": "7109", "country": "Australia"}',
    'Premium Leatherwood honey from the pristine Tasmanian wilderness. Our bees have exclusive access to ancient rainforests.',
    'https://images.unsplash.com/photo-1550411294-098c0dc9db6f?w=400',
    NULL,
    'submitted',
    'none',
    '2025-01-02T00:00:00Z',
    '2025-01-02T00:00:00Z'
  );

-- =============================================================
-- Verification Submissions
-- =============================================================

INSERT INTO verification_submissions (id, producer_id, status, submitted_at, created_at) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000003', 'submitted', '2025-01-02T08:10:00Z', '2025-01-02T08:00:00Z');

-- =============================================================
-- Verification Documents
-- =============================================================

INSERT INTO verification_documents (id, submission_id, type, name, url, uploaded_at) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000001', 'business_registration', 'Business Registration.pdf', '/documents/business-reg.pdf', '2025-01-02T08:00:00Z'),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000001', 'beekeeper_registration', 'TAS Beekeeper License.pdf', '/documents/beekeeper.pdf', '2025-01-02T08:05:00Z');

-- =============================================================
-- Batches
-- =============================================================

INSERT INTO batches (id, producer_id, name, region, harvest_date, extraction_date, floral_source_tags, quantity_kg, notes, status, created_at, updated_at) VALUES
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0002-000000000001', 'Summer 2024 Harvest', 'Beechworth, Victoria', '2024-12-15', '2024-12-18', ARRAY['Yellow Box', 'Ironbark', 'Native Wildflowers'], 120, 'Exceptional clarity this season. Strong floral notes with hints of caramel.', 'active', '2024-12-18T00:00:00Z', '2024-12-18T00:00:00Z'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0002-000000000001', 'Alpine November 2024', 'Alpine High Country, Victoria', '2024-11-20', '2024-11-22', ARRAY['Snow Gum', 'Mountain Ash'], 45, 'Limited alpine harvest with distinctive eucalyptus character.', 'active', '2024-11-22T00:00:00Z', '2024-11-22T00:00:00Z'),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0002-000000000002', 'Mudgee December 2024', 'Mudgee, New South Wales', '2024-12-01', '2024-12-03', ARRAY['Blue Gum', 'Clover', 'Lucerne'], 200, 'Light golden color with mild, sweet flavor profile.', 'active', '2024-12-03T00:00:00Z', '2024-12-03T00:00:00Z'),
  ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0002-000000000002', 'Hunter Valley Manuka Oct 2024', 'Hunter Valley, New South Wales', '2024-10-15', '2024-10-17', ARRAY['Manuka', 'Tea Tree'], 60, NULL, 'active', '2024-10-17T00:00:00Z', '2024-10-17T00:00:00Z');

-- =============================================================
-- Products
-- =============================================================

INSERT INTO products (id, producer_id, batch_id, title, description, photos, status, nutritional_info, average_rating, review_count, created_at, updated_at) VALUES
  ('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0005-000000000001', 'Yellow Box Raw Honey', 'Our signature Yellow Box honey is renowned for its smooth, buttery flavor with subtle citrus undertones. Harvested from bees foraging on native Yellow Box eucalyptus in the Victorian high country. Perfect for drizzling on toast, adding to tea, or enjoying straight from the jar.', ARRAY['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800'], 'approved', '{"servingSize": "20g (1 tablespoon)", "energyKj": 272, "protein": 0.1, "fatTotal": 0, "carbohydrates": 16.4, "sugars": 16.0, "sodium": 2}', 5.00, 1, '2024-12-20T00:00:00Z', '2025-01-05T00:00:00Z'),
  ('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0005-000000000002', 'Alpine Snow Gum Honey', 'A rare treat from our high-altitude hives. This limited-edition honey captures the essence of the Victorian Alps with its distinctive menthol-eucalyptus notes and crystalline amber color. Each jar is numbered from this small-batch harvest.', ARRAY['https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800'], 'approved', NULL, 5.00, 1, '2024-11-25T00:00:00Z', '2024-12-01T00:00:00Z'),
  ('00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0005-000000000003', 'Mudgee Wildflower Blend', 'A delightful blend of wildflower nectars from the rolling hills of Mudgee wine country. Light and floral with notes of clover and native blossoms. Pairs beautifully with cheese boards and fresh bread.', ARRAY['https://images.pexels.com/photos/5634208/pexels-photo-5634208.jpeg?w=800', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'], 'approved', NULL, 4.00, 1, '2024-12-10T00:00:00Z', '2025-01-02T00:00:00Z'),
  ('00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0005-000000000004', 'Hunter Valley Manuka Honey', 'Premium Australian Manuka honey with verified MGO rating. Known for its distinctive earthy flavor and potential wellness benefits. Dark amber color with a thick, luxurious texture.', ARRAY['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'], 'approved', NULL, NULL, 0, '2024-10-20T00:00:00Z', '2024-12-15T00:00:00Z'),
  ('00000000-0000-0000-0006-000000000005', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0005-000000000001', 'Ironbark Honey - Dark & Rich', 'Bold and robust Ironbark honey with deep amber color and complex flavor profile. Notes of molasses and eucalyptus. Excellent for baking and marinades.', ARRAY['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800'], 'approved', NULL, NULL, 0, '2024-12-22T00:00:00Z', '2025-01-03T00:00:00Z');

-- =============================================================
-- Product Variants
-- =============================================================

INSERT INTO product_variants (id, product_id, size, price, stock, weight) VALUES
  -- Product 1: Yellow Box Raw Honey
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0006-000000000001', '250g', 18.50, 50, 250),
  ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0006-000000000001', '500g', 33.30, 40, 500),
  ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0006-000000000001', '1kg', 59.20, 25, 1000),
  -- Product 2: Alpine Snow Gum Honey
  ('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0006-000000000002', '250g', 24.00, 20, 250),
  ('00000000-0000-0000-0007-000000000005', '00000000-0000-0000-0006-000000000002', '500g', 43.20, 16, 500),
  ('00000000-0000-0000-0007-000000000006', '00000000-0000-0000-0006-000000000002', '1kg', 76.80, 10, 1000),
  -- Product 3: Mudgee Wildflower Blend
  ('00000000-0000-0000-0007-000000000007', '00000000-0000-0000-0006-000000000003', '250g', 16.00, 75, 250),
  ('00000000-0000-0000-0007-000000000008', '00000000-0000-0000-0006-000000000003', '500g', 28.80, 60, 500),
  ('00000000-0000-0000-0007-000000000009', '00000000-0000-0000-0006-000000000003', '1kg', 51.20, 37, 1000),
  -- Product 4: Hunter Valley Manuka Honey
  ('00000000-0000-0000-0007-000000000010', '00000000-0000-0000-0006-000000000004', '250g', 35.00, 30, 250),
  ('00000000-0000-0000-0007-000000000011', '00000000-0000-0000-0006-000000000004', '500g', 65.00, 20, 500),
  -- Product 5: Ironbark Honey
  ('00000000-0000-0000-0007-000000000012', '00000000-0000-0000-0006-000000000005', '250g', 20.00, 40, 250),
  ('00000000-0000-0000-0007-000000000013', '00000000-0000-0000-0006-000000000005', '500g', 36.00, 32, 500),
  ('00000000-0000-0000-0007-000000000014', '00000000-0000-0000-0006-000000000005', '1kg', 64.00, 20, 1000);

-- =============================================================
-- Orders
-- =============================================================

INSERT INTO orders (id, buyer_id, order_number, status, subtotal, shipping_total, platform_fee_total, gst_total, total, shipping_address, created_at, updated_at) VALUES
  ('00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0000-000000000001', 'HJ-20241228-0001', 'delivered', 66.60, 12.00, 6.66, 6.06, 84.66, '{"street": "10 Sample Street", "suburb": "Melbourne", "state": "VIC", "postcode": "3000", "country": "Australia"}', '2024-12-28T10:00:00Z', '2025-01-02T14:00:00Z'),
  ('00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0000-000000000001', 'HJ-20250105-0002', 'confirmed', 35.00, 10.00, 3.50, 3.18, 48.18, '{"street": "10 Sample Street", "suburb": "Melbourne", "state": "VIC", "postcode": "3000", "country": "Australia"}', '2025-01-05T09:00:00Z', '2025-01-06T11:00:00Z');

-- =============================================================
-- Payments
-- =============================================================

INSERT INTO payments (id, order_id, stripe_payment_intent_id, amount, currency, status, method, paid_at, created_at, updated_at) VALUES
  ('00000000-0000-0000-0009-000000000001', '00000000-0000-0000-0008-000000000001', 'pi_mock_123456', 84.66, 'AUD', 'succeeded', 'card', '2024-12-28T10:05:00Z', '2024-12-28T10:00:00Z', '2024-12-28T10:05:00Z'),
  ('00000000-0000-0000-0009-000000000002', '00000000-0000-0000-0008-000000000002', 'pi_mock_789012', 48.18, 'AUD', 'succeeded', 'card', '2025-01-05T09:05:00Z', '2025-01-05T09:00:00Z', '2025-01-05T09:05:00Z');

-- =============================================================
-- Sub-Orders
-- =============================================================

INSERT INTO sub_orders (id, order_id, seller_id, status, subtotal, shipping_cost, platform_fee, gst, total, created_at, updated_at) VALUES
  ('00000000-0000-0000-000a-000000000001', '00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0002-000000000001', 'delivered', 66.60, 12.00, 6.66, 6.06, 84.66, '2024-12-28T10:00:00Z', '2025-01-02T14:00:00Z'),
  ('00000000-0000-0000-000a-000000000002', '00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0002-000000000002', 'shipped', 35.00, 10.00, 3.50, 3.18, 48.18, '2025-01-05T09:00:00Z', '2025-01-06T11:00:00Z');

-- =============================================================
-- Order Items
-- =============================================================

INSERT INTO order_items (id, sub_order_id, product_id, variant_id, product_title, variant_size, quantity, unit_price, gst, batch_snapshot) VALUES
  ('00000000-0000-0000-000b-000000000001', '00000000-0000-0000-000a-000000000001', '00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0007-000000000002', 'Yellow Box Raw Honey', '500g', 2, 33.30, 3.03, '{"batchId": "00000000-0000-0000-0005-000000000001", "region": "Beechworth, Victoria", "harvestDate": "2024-12-15", "floralSources": ["Yellow Box", "Ironbark"]}'),
  ('00000000-0000-0000-000b-000000000002', '00000000-0000-0000-000a-000000000002', '00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0007-000000000010', 'Hunter Valley Manuka Honey', '250g', 1, 35.00, 3.18, '{"batchId": "00000000-0000-0000-0005-000000000004", "region": "Hunter Valley, NSW", "harvestDate": "2024-10-15", "floralSources": ["Manuka", "Tea Tree"]}');

-- =============================================================
-- Shipments
-- =============================================================

INSERT INTO shipments (id, sub_order_id, carrier, tracking_number, tracking_url, status, estimated_delivery, shipped_at, delivered_at, created_at, updated_at) VALUES
  ('00000000-0000-0000-000c-000000000001', '00000000-0000-0000-000a-000000000001', 'australia_post', 'AP123456789AU', 'https://auspost.com.au/track/AP123456789AU', 'delivered', NULL, '2024-12-29T10:00:00Z', '2025-01-02T14:00:00Z', '2024-12-29T10:00:00Z', '2025-01-02T14:00:00Z'),
  ('00000000-0000-0000-000c-000000000002', '00000000-0000-0000-000a-000000000002', 'australia_post', 'AP987654321AU', 'https://auspost.com.au/track/AP987654321AU', 'in_transit', '2025-01-10', '2025-01-06T11:00:00Z', NULL, '2025-01-06T11:00:00Z', '2025-01-07T09:00:00Z');

-- =============================================================
-- Shipment Events
-- =============================================================

INSERT INTO shipment_events (id, shipment_id, status, description, location, occurred_at, created_at) VALUES
  ('00000000-0000-0000-000d-000000000001', '00000000-0000-0000-000c-000000000001', 'picked_up', 'Parcel picked up from sender', 'Beechworth, VIC', '2024-12-29T10:00:00Z', '2024-12-29T10:00:00Z'),
  ('00000000-0000-0000-000d-000000000002', '00000000-0000-0000-000c-000000000001', 'in_transit', 'In transit to delivery facility', 'Melbourne, VIC', '2024-12-31T08:00:00Z', '2024-12-31T08:00:00Z'),
  ('00000000-0000-0000-000d-000000000003', '00000000-0000-0000-000c-000000000001', 'delivered', 'Delivered to recipient', 'Melbourne, VIC', '2025-01-02T14:00:00Z', '2025-01-02T14:00:00Z'),
  ('00000000-0000-0000-000d-000000000004', '00000000-0000-0000-000c-000000000002', 'picked_up', 'Parcel picked up from sender', 'Mudgee, NSW', '2025-01-06T11:00:00Z', '2025-01-06T11:00:00Z'),
  ('00000000-0000-0000-000d-000000000005', '00000000-0000-0000-000c-000000000002', 'in_transit', 'In transit to delivery facility', 'Sydney, NSW', '2025-01-07T09:00:00Z', '2025-01-07T09:00:00Z');

-- =============================================================
-- Reviews
-- =============================================================

INSERT INTO reviews (id, product_id, buyer_id, order_id, rating, title, comment, created_at) VALUES
  ('00000000-0000-0000-000e-000000000001', '00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0008-000000000001', 5, 'Absolutely incredible honey!', 'Absolutely delicious honey! The flavor is incredible and you can really taste the difference from supermarket honey. Will definitely order again.', '2025-01-03T10:00:00Z'),
  ('00000000-0000-0000-000e-000000000002', '00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0008-000000000001', 5, 'Worth every cent', 'The Alpine honey is exceptional. Such a unique flavor profile. Worth every cent!', '2024-12-20T15:00:00Z'),
  ('00000000-0000-0000-000e-000000000003', '00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0008-000000000001', 4, 'Great everyday honey', 'Lovely light honey, perfect for everyday use. Fast shipping too.', '2025-01-01T09:00:00Z');

-- =============================================================
-- Producer Floral Sources
-- =============================================================
-- Links producers to their floral sources based on their batches
-- Note: floral_sources table is seeded in migration, so we reference by name lookup

INSERT INTO producer_floral_sources (id, producer_id, floral_source_id, created_at)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0002-000000000001'::uuid, -- Golden Hive Apiaries
  fs.id,
  '2024-06-15T00:00:00Z'::timestamptz
FROM floral_sources fs
WHERE fs.name IN ('Yellow Box', 'Ironbark', 'Mountain Ash')
ON CONFLICT (producer_id, floral_source_id) DO NOTHING;

INSERT INTO producer_floral_sources (id, producer_id, floral_source_id, created_at)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0002-000000000002'::uuid, -- Sunny Meadows Honey
  fs.id,
  '2024-08-20T00:00:00Z'::timestamptz
FROM floral_sources fs
WHERE fs.name IN ('Blue Gum', 'Clover', 'Lucerne (Alfalfa)', 'Manuka', 'Tea Tree')
ON CONFLICT (producer_id, floral_source_id) DO NOTHING;

INSERT INTO producer_floral_sources (id, producer_id, floral_source_id, created_at)
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0002-000000000003'::uuid, -- Tasmania Pure Honey
  fs.id,
  '2025-01-02T00:00:00Z'::timestamptz
FROM floral_sources fs
WHERE fs.name = 'Leatherwood'
ON CONFLICT (producer_id, floral_source_id) DO NOTHING;

-- =============================================================
-- Seller Declarations
-- =============================================================
-- Sample declarations for approved producers

INSERT INTO seller_declarations (
  id, 
  producer_id, 
  user_id,
  declaration_1, 
  declaration_2, 
  declaration_3, 
  declaration_4, 
  declaration_5, 
  declaration_6, 
  declaration_7, 
  declaration_8,
  terms_accepted,
  terms_accepted_at,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-000f-000000000001',
    '00000000-0000-0000-0002-000000000001', -- Golden Hive Apiaries
    '00000000-0000-0000-0000-000000000002', -- Sarah Mitchell
    true, -- Registered Australian beekeeper
    true, -- Owner/authorised manager of hives
    true, -- Honey from own hives only
    true, -- No imported/blended/adulterated honey
    true, -- Raw and natural honey only
    true, -- Compliance with Australian laws
    true, -- Acknowledge verification requests
    true, -- Acknowledge consequences of false information
    true,
    '2024-06-15T10:00:00Z'::timestamptz,
    '2024-06-15T10:00:00Z'::timestamptz,
    '2024-06-15T10:00:00Z'::timestamptz
  ),
  (
    '00000000-0000-0000-000f-000000000002',
    '00000000-0000-0000-0002-000000000002', -- Sunny Meadows Honey
    '00000000-0000-0000-0000-000000000003', -- Tom Clarke
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    '2024-08-20T11:00:00Z'::timestamptz,
    '2024-08-20T11:00:00Z'::timestamptz,
    '2024-08-20T11:00:00Z'::timestamptz
  );

-- =============================================================
-- Producer Application Log
-- =============================================================
-- Sample application log entries showing approval process

INSERT INTO producer_application_log (
  id,
  producer_id,
  admin_id,
  action,
  previous_status,
  new_status,
  notes,
  created_at
) VALUES
  (
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0002-000000000001', -- Golden Hive Apiaries
    '00000000-0000-0000-0000-000000000004', -- Admin User
    'submitted',
    NULL,
    'pending_review',
    'Initial application submitted',
    '2024-06-15T09:00:00Z'::timestamptz
  ),
  (
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0002-000000000001', -- Golden Hive Apiaries
    '00000000-0000-0000-0000-000000000004', -- Admin User
    'approved',
    'pending_review',
    'approved',
    'All documentation verified. Producer approved.',
    '2024-06-20T14:30:00Z'::timestamptz
  ),
  (
    '00000000-0000-0000-0010-000000000003',
    '00000000-0000-0000-0002-000000000002', -- Sunny Meadows Honey
    '00000000-0000-0000-0000-000000000004', -- Admin User
    'submitted',
    NULL,
    'pending_review',
    'Initial application submitted',
    '2024-08-20T10:00:00Z'::timestamptz
  ),
  (
    '00000000-0000-0000-0010-000000000004',
    '00000000-0000-0000-0002-000000000002', -- Sunny Meadows Honey
    '00000000-0000-0000-0000-000000000004', -- Admin User
    'approved',
    'pending_review',
    'approved',
    'Premium producer status granted due to exceptional quality standards.',
    '2024-08-25T16:00:00Z'::timestamptz
  ),
  (
    '00000000-0000-0000-0010-000000000005',
    '00000000-0000-0000-0002-000000000003', -- Tasmania Pure Honey
    '00000000-0000-0000-0000-000000000005', -- Emily Brooks
    'submitted',
    NULL,
    'pending_review',
    'Application submitted, awaiting review',
    '2025-01-02T08:00:00Z'::timestamptz
  );
