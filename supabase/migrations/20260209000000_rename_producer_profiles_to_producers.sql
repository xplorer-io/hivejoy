-- =============================================================
-- Migration: Rename producer_profiles to producers
-- =============================================================
-- This migration renames the producer_profiles table to producers
-- to match teammate's schema naming convention, and updates all
-- foreign key references accordingly.
-- =============================================================

-- Rename the table only if producer_profiles exists and producers doesn't exist
-- Note: If producers already exists (from teammate's schema), skip the rename
DO $$
BEGIN
  -- Check if producer_profiles exists and producers doesn't exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'producer_profiles'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'producers'
  ) THEN
    -- Rename the table
    -- Note: PostgreSQL automatically updates all foreign key constraints when you rename a table
    ALTER TABLE public.producer_profiles RENAME TO producers;
    
    -- Recreate the trigger on the renamed table
    DROP TRIGGER IF EXISTS set_updated_at ON producer_profiles;
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON producers
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  ELSE
    -- If producers already exists, ensure it has the trigger
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'producers'
    ) THEN
      DROP TRIGGER IF EXISTS set_updated_at ON producers;
      CREATE TRIGGER set_updated_at BEFORE UPDATE ON producers
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
    END IF;
  END IF;
END $$;
