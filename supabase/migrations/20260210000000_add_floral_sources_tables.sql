-- =============================================================
-- Migration: Add Floral Sources Tables
-- =============================================================
-- Creates floral_sources taxonomy table and producer_floral_sources
-- many-to-many relationship table. Adapted from teammate's migration.
-- =============================================================

-- ==================== FLORAL SOURCES TAXONOMY ====================
CREATE TABLE IF NOT EXISTS public.floral_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  scientific_name TEXT,
  region_exclusive BOOLEAN DEFAULT false, -- e.g., Manuka (Tasmania/NZ), Jellybush (NSW)
  region_state TEXT[], -- States where this floral is found
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert floral sources from specification
INSERT INTO public.floral_sources (name, region_exclusive, region_state) VALUES
  ('Almond', false, ARRAY['VIC', 'SA', 'NSW']),
  ('Angophora (Sydney Red Gum)', false, ARRAY['NSW']),
  ('Avocado', false, ARRAY['QLD', 'NSW', 'VIC']),
  ('Banksia', false, ARRAY['WA', 'NSW', 'VIC', 'SA']),
  ('Black Box', false, ARRAY['NSW', 'VIC', 'SA']),
  ('Blackbutt', false, ARRAY['NSW', 'QLD']),
  ('Blue Gum', false, ARRAY['NSW', 'VIC', 'TAS', 'SA']),
  ('Blueberry', false, ARRAY['TAS', 'VIC', 'NSW']),
  ('Canola', false, ARRAY['WA', 'VIC', 'NSW', 'SA']),
  ('Clover', false, ARRAY[]::TEXT[]), -- Nationwide
  ('Forest Red Gum', false, ARRAY['NSW', 'QLD']),
  ('Grey Box', false, ARRAY['NSW', 'VIC', 'SA']),
  ('Ironbark', false, ARRAY['NSW', 'QLD', 'VIC']),
  ('Jarrah', true, ARRAY['WA']),
  ('Jelly Bush', true, ARRAY['NSW']),
  ('Karri', true, ARRAY['WA']),
  ('Leatherwood', true, ARRAY['TAS']),
  ('Lucerne (Alfalfa)', false, ARRAY[]::TEXT[]), -- Nationwide
  ('Macadamia', false, ARRAY['QLD', 'NSW']),
  ('Mallee', false, ARRAY['VIC', 'SA', 'NSW', 'WA']),
  ('Manuka', true, ARRAY['TAS', 'VIC']),
  ('Mountain Ash', false, ARRAY['VIC', 'TAS']),
  ('Orange Blossom', false, ARRAY['NSW', 'VIC', 'SA']),
  ('Paperbark', false, ARRAY['NSW', 'QLD', 'NT', 'WA']),
  ('Red Box', false, ARRAY['NSW', 'VIC', 'SA']),
  ('Red Gum', false, ARRAY['NSW', 'VIC', 'SA']),
  ('River Red Gum', false, ARRAY['NSW', 'VIC', 'SA', 'QLD']),
  ('Spotted Gum', false, ARRAY['NSW', 'QLD']),
  ('Stringybark', false, ARRAY['NSW', 'VIC', 'TAS']),
  ('Sugar Gum', false, ARRAY['SA', 'VIC']),
  ('Sugarbag', false, ARRAY['QLD', 'NSW', 'NT', 'WA']),
  ('Sunflower', false, ARRAY[]::TEXT[]), -- Nationwide
  ('Swamp Mahogany', false, ARRAY['NSW', 'QLD']),
  ('Tea Tree', false, ARRAY['NSW', 'VIC', 'TAS']),
  ('White Box', false, ARRAY['NSW', 'VIC']),
  ('Yellow Box', false, ARRAY['NSW', 'VIC', 'SA'])
ON CONFLICT (name) DO NOTHING;

-- ==================== PRODUCER FLORAL SOURCES (Many-to-Many) ====================
CREATE TABLE IF NOT EXISTS public.producer_floral_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
  floral_source_id UUID REFERENCES public.floral_sources(id) ON DELETE CASCADE,
  other_floral_source TEXT, -- For "Other" option
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(producer_id, floral_source_id)
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_producer_floral_sources_producer_id ON public.producer_floral_sources(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_floral_sources_floral_source_id ON public.producer_floral_sources(floral_source_id);

-- ==================== COMMENTS ====================
COMMENT ON TABLE public.floral_sources IS 'Taxonomy of honey floral sources with region information for validation';
COMMENT ON TABLE public.producer_floral_sources IS 'Many-to-many relationship between producers and their floral sources';
