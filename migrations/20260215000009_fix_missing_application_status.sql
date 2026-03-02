-- Migration: Fix missing application_status for existing producers
-- This updates any producers that don't have an application_status set

-- Set application_status to 'pending_review' for producers that:
-- 1. Have NULL application_status
-- 2. Have verification_status = 'pending' (not yet approved)
UPDATE public.producers
SET 
  application_status = 'pending_review',
  application_submitted_at = COALESCE(application_submitted_at, created_at)
WHERE application_status IS NULL
  AND verification_status = 'pending';

-- Set application_status to 'approved' for producers that:
-- 1. Have NULL application_status
-- 2. Have verification_status = 'approved' (already approved)
UPDATE public.producers
SET 
  application_status = 'approved',
  application_approved_at = COALESCE(application_approved_at, updated_at)
WHERE application_status IS NULL
  AND verification_status = 'approved';

-- Set application_status to 'rejected' for producers that:
-- 1. Have NULL application_status
-- 2. Have verification_status = 'rejected' (already rejected)
UPDATE public.producers
SET 
  application_status = 'rejected',
  application_rejected_at = COALESCE(application_rejected_at, updated_at)
WHERE application_status IS NULL
  AND verification_status = 'rejected';
