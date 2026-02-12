-- =============================================================
-- Migration: Add Seller Onboarding Fields
-- =============================================================
-- Adds comprehensive seller onboarding fields to producers table
-- and creates producer_application_log table.
-- Adapted from teammate's migration: changed profiles→users references.
-- =============================================================

-- ==================== EXPAND PRODUCERS TABLE ====================
-- Add new columns to producers table for comprehensive onboarding

ALTER TABLE public.producers
  -- A. Identity
  ADD COLUMN IF NOT EXISTS full_legal_name TEXT,
  ADD COLUMN IF NOT EXISTS seller_type TEXT CHECK (seller_type IN ('individual', 'registered_business')),
  ADD COLUMN IF NOT EXISTS trading_name TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS social_profile TEXT,
  ADD COLUMN IF NOT EXISTS abn_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS abn_verified_at TIMESTAMPTZ,

  -- B. Contact Details
  ADD COLUMN IF NOT EXISTS primary_email TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS secondary_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS secondary_phone TEXT,
  ADD COLUMN IF NOT EXISTS secondary_email TEXT,

  -- C. Address Information
  ADD COLUMN IF NOT EXISTS physical_address_street TEXT,
  ADD COLUMN IF NOT EXISTS physical_address_suburb TEXT,
  ADD COLUMN IF NOT EXISTS physical_address_state TEXT,
  ADD COLUMN IF NOT EXISTS physical_address_postcode TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_street TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_suburb TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_state TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_postcode TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_different BOOLEAN DEFAULT false,

  -- D. Beekeeper Verification
  ADD COLUMN IF NOT EXISTS is_registered_beekeeper BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS beekeeper_registration_number TEXT,
  ADD COLUMN IF NOT EXISTS registering_authority TEXT,
  ADD COLUMN IF NOT EXISTS registering_authority_other TEXT,
  ADD COLUMN IF NOT EXISTS registration_proof_url TEXT, -- Cloudinary URL
  ADD COLUMN IF NOT EXISTS apiary_photo_url TEXT, -- Cloudinary URL
  ADD COLUMN IF NOT EXISTS declaration_hive_owner BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS declaration_own_hives BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS declaration_no_imported BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS declaration_raw_natural BOOLEAN DEFAULT false,

  -- E. Honey Production Details
  ADD COLUMN IF NOT EXISTS number_of_hives INTEGER,
  ADD COLUMN IF NOT EXISTS harvest_regions TEXT[], -- Array of state + locality
  ADD COLUMN IF NOT EXISTS typical_harvest_months TEXT[], -- Array of months
  ADD COLUMN IF NOT EXISTS extraction_method TEXT,
  ADD COLUMN IF NOT EXISTS certifications TEXT[], -- Array of certifications

  -- F. Compliance & Food Safety
  ADD COLUMN IF NOT EXISTS food_safety_compliant BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS food_handling_registration_number TEXT,
  ADD COLUMN IF NOT EXISTS local_council_authority TEXT,
  ADD COLUMN IF NOT EXISTS declaration_compliance_documents BOOLEAN DEFAULT false,

  -- G. Payout & Commercial Details
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_bsb TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS gst_registered BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS gst_included_in_pricing BOOLEAN DEFAULT false,

  -- Application Status & Approval
  ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'draft' CHECK (application_status IN ('draft', 'pending_review', 'changes_requested', 'approved', 'rejected', 'suspended')),
  ADD COLUMN IF NOT EXISTS application_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS application_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS application_rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT, -- Internal admin notes
  ADD COLUMN IF NOT EXISTS changes_requested_fields TEXT[], -- Array of field names that need changes
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.users(id);

-- ==================== APPLICATION AUDIT LOG ====================
CREATE TABLE IF NOT EXISTS public.producer_application_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID REFERENCES public.producers(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.users(id), -- Changed from profiles to users
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'changes_requested', 'suspended', 'updated', 'resubmitted')),
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  changed_fields TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_producer_application_log_producer_id ON public.producer_application_log(producer_id);
CREATE INDEX IF NOT EXISTS idx_producer_application_log_created_at ON public.producer_application_log(created_at);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_producers_application_status ON public.producers(application_status);
CREATE INDEX IF NOT EXISTS idx_producers_beekeeper_registration ON public.producers(beekeeper_registration_number);

-- ==================== COMMENTS ====================
COMMENT ON TABLE public.producer_application_log IS 'Audit log of all application status changes and admin actions';
