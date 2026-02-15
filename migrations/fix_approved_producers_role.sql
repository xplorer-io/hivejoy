-- Migration: Update role to 'producer' for all approved producers
-- This fixes the issue where approved producers still have 'consumer' role in profiles table

-- Update profiles.role to 'producer' for all users who have an approved producer profile
UPDATE public.profiles
SET 
  role = 'producer',
  updated_at = NOW()
WHERE id IN (
  SELECT user_id 
  FROM public.producers 
  WHERE (application_status = 'approved' OR verification_status = 'approved')
  AND user_id IS NOT NULL
)
AND role != 'producer';

-- Verify the update
SELECT 
  p.id,
  p.email,
  p.role,
  pr.business_name,
  pr.application_status,
  pr.verification_status
FROM public.profiles p
INNER JOIN public.producers pr ON pr.user_id = p.id
WHERE (pr.application_status = 'approved' OR pr.verification_status = 'approved')
ORDER BY p.email;
