-- Add verified badge to all producers
-- Run in Supabase SQL Editor

UPDATE public.producers
SET
  badge_level = 'verified',
  updated_at = NOW()
WHERE badge_level = 'none' OR badge_level IS NULL;

-- Verify
SELECT id, business_name, badge_level, updated_at
FROM public.producers
ORDER BY updated_at DESC
LIMIT 20;
