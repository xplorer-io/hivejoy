-- Migration: Set admin users
-- This migration sets the specified email addresses as admin users

-- Update the profile role to 'admin' for the specified emails
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email IN ('adarsha.aryal653@gmail.com', 'Zasa1919@hotmail.com');

-- If the users don't have a profile yet, create one
-- First, we need to find their auth.users ID
INSERT INTO public.profiles (id, email, role, status)
SELECT 
  au.id,
  au.email,
  'admin' as role,
  'active' as status
FROM auth.users au
WHERE au.email IN ('adarsha.aryal653@gmail.com', 'Zasa1919@hotmail.com')
  AND au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  updated_at = NOW();

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
