-- Migration: Add admin by email
-- Run in Supabase SQL Editor. Replace REPLACE_WITH_ADMIN_EMAIL with the admin email before running.

UPDATE public.profiles
SET
  role = 'admin',
  updated_at = NOW()
WHERE email = 'REPLACE_WITH_ADMIN_EMAIL';

INSERT INTO public.profiles (id, email, role, status)
SELECT
  au.id,
  au.email,
  'admin' AS role,
  'active' AS status
FROM auth.users au
WHERE au.email = 'REPLACE_WITH_ADMIN_EMAIL'
  AND au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE
SET
  role = 'admin',
  updated_at = NOW();
