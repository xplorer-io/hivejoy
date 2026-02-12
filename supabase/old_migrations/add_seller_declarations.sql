-- Migration: Add Seller Declarations Archive Table
-- This table stores seller declarations as a legal archive with timestamps

CREATE TABLE IF NOT EXISTS public.seller_declarations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Declaration checkboxes (all must be true)
  declaration_1 BOOLEAN NOT NULL DEFAULT false, -- Registered Australian beekeeper
  declaration_2 BOOLEAN NOT NULL DEFAULT false, -- Owner/authorised manager of hives
  declaration_3 BOOLEAN NOT NULL DEFAULT false, -- Honey from own hives only
  declaration_4 BOOLEAN NOT NULL DEFAULT false, -- No imported/blended/adulterated honey
  declaration_5 BOOLEAN NOT NULL DEFAULT false, -- Raw and natural honey only
  declaration_6 BOOLEAN NOT NULL DEFAULT false, -- Compliance with Australian laws
  declaration_7 BOOLEAN NOT NULL DEFAULT false, -- Acknowledge verification requests
  declaration_8 BOOLEAN NOT NULL DEFAULT false, -- Acknowledge consequences of false information
  
  -- Terms & Conditions acceptance
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  
  -- Legal metadata
  ip_address TEXT, -- Store IP for legal purposes
  user_agent TEXT, -- Store user agent for legal purposes
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_seller_declarations_producer_id ON public.seller_declarations(producer_id);
CREATE INDEX IF NOT EXISTS idx_seller_declarations_user_id ON public.seller_declarations(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_declarations_created_at ON public.seller_declarations(created_at);

-- Add comment for documentation
COMMENT ON TABLE public.seller_declarations IS 'Legal archive of seller declarations and terms acceptance. All declarations must be true for submission.';