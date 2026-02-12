-- =============================================================
-- Migration: Allow NULL floral_source_id
-- =============================================================
-- Allows NULL floral_source_id for "other" custom floral sources
-- and updates unique constraints accordingly.
-- Adapted from teammate's migration.
-- =============================================================

-- Allow NULL floral_source_id for "other" custom floral sources
ALTER TABLE public.producer_floral_sources
  ALTER COLUMN floral_source_id DROP NOT NULL;

-- Update unique constraint to allow multiple NULL values (for different "other" sources)
-- PostgreSQL allows multiple NULLs in unique constraints by default, but let's make it explicit
-- Drop the existing unique constraint (it might be a constraint or index)
DO $$
BEGIN
  -- Try dropping as constraint first
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'producer_floral_sources_producer_id_floral_source_id_key'
  ) THEN
    ALTER TABLE public.producer_floral_sources 
    DROP CONSTRAINT IF EXISTS producer_floral_sources_producer_id_floral_source_id_key;
  END IF;
  
  -- Try dropping as index if it exists
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'producer_floral_sources_producer_id_floral_source_id_key'
  ) THEN
    DROP INDEX IF EXISTS producer_floral_sources_producer_id_floral_source_id_key;
  END IF;
END $$;

-- Create a partial unique index that only applies when floral_source_id is NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS producer_floral_sources_producer_id_floral_source_id_key 
  ON public.producer_floral_sources(producer_id, floral_source_id) 
  WHERE floral_source_id IS NOT NULL;

-- Add a unique constraint for "other" sources (producer_id + other_floral_source)
CREATE UNIQUE INDEX IF NOT EXISTS producer_floral_sources_producer_id_other_key 
  ON public.producer_floral_sources(producer_id, other_floral_source) 
  WHERE floral_source_id IS NULL AND other_floral_source IS NOT NULL;
