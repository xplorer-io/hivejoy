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
DROP INDEX IF EXISTS producer_floral_sources_producer_id_floral_source_id_key;
CREATE UNIQUE INDEX producer_floral_sources_producer_id_floral_source_id_key 
  ON public.producer_floral_sources(producer_id, floral_source_id) 
  WHERE floral_source_id IS NOT NULL;

-- Add a unique constraint for "other" sources (producer_id + other_floral_source)
CREATE UNIQUE INDEX IF NOT EXISTS producer_floral_sources_producer_id_other_key 
  ON public.producer_floral_sources(producer_id, other_floral_source) 
  WHERE floral_source_id IS NULL AND other_floral_source IS NOT NULL;
