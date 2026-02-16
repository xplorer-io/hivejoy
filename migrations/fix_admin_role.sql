-- Migration: Fix admin role for adarsha.aryal653@gmail.com
-- This user should be admin, not producer

-- Update the profile role to 'admin' for adarsha.aryal653@gmail.com
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'adarsha.aryal653@gmail.com'
AND role != 'admin';

-- Also ensure Zasa1919@hotmail.com is admin
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'Zasa1919@hotmail.com'
AND role != 'admin';

-- Verify the update
SELECT 
  p.id,
  p.email,
  p.role,
  p.status,
  p.updated_at
FROM public.profiles p
WHERE p.email IN ('adarsha.aryal653@gmail.com', 'Zasa1919@hotmail.com')
ORDER BY p.email;
