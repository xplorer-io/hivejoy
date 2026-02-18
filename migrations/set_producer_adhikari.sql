-- Set asthaadhikari2024 / adhikariastha2024 as producer (approved seller)
-- Run in Supabase SQL Editor

UPDATE public.profiles
SET
  role = 'producer',
  updated_at = NOW()
WHERE email IN (
  'asthaadhikari2024@gmail.com',
  'adhikariastha2024@gmail.com'
);

-- Verify
SELECT id, email, role, status, updated_at
FROM public.profiles
WHERE email IN (
  'asthaadhikari2024@gmail.com',
  'adhikariastha2024@gmail.com'
);
