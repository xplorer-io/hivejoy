-- Migration: Add adarshathegreat653@gmail.com as admin
-- Run this in the Supabase SQL editor (or via migration runner)

-- Update existing profile to admin
UPDATE public.profiles
SET
  role = 'admin',
  updated_at = NOW()
WHERE email = 'adarshathegreat653@gmail.com';

-- If user exists in auth.users but has no profile, create one with admin role
INSERT INTO public.profiles (id, email, role, status)
SELECT
  au.id,
  au.email,
  'admin' AS role,
  'active' AS status
FROM auth.users au
WHERE au.email = 'adarshathegreat653@gmail.com'
  AND au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE
SET
  role = 'admin',
  updated_at = NOW();

-- Verify
SELECT id, email, role, status, updated_at
FROM public.profiles
WHERE email = 'adarshathegreat653@gmail.com';
