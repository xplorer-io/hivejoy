-- =============================================================
-- Migration: Rename producer_profiles to producers
-- =============================================================
-- This migration renames the producer_profiles table to producers
-- to match teammate's schema naming convention, and updates all
-- foreign key references accordingly.
-- =============================================================

-- Rename the table
-- Note: PostgreSQL automatically updates all foreign key constraints when you rename a table
ALTER TABLE IF EXISTS public.producer_profiles RENAME TO producers;

-- Recreate the trigger on the renamed table
-- Drop the old trigger if it exists (it will be automatically dropped, but being safe)
DROP TRIGGER IF EXISTS set_updated_at ON producer_profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON producers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
