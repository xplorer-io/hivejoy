-- Set specific users as producer (approved seller)
-- Run in Supabase SQL Editor. Replace the placeholder with actual profile IDs or run
-- a one-off query with real identifiers; do not commit literal emails to the repo.

-- Example: update by profile id (preferred)
-- UPDATE public.profiles SET role = 'producer', updated_at = NOW() WHERE id IN ('uuid-1', 'uuid-2');

-- Example: update by email (run manually, then remove or parameterize)
-- UPDATE public.profiles SET role = 'producer', updated_at = NOW() WHERE email IN ('user1@example.com', 'user2@example.com');
