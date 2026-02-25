-- Migration: Make profile creation trigger completely safe
-- We cannot disable triggers on auth.users (system table), so we make the function do nothing
-- Profile creation will be handled entirely in application code

-- Replace the function to do nothing (but still return NEW to not break the trigger)
-- This prevents any errors from blocking user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Do nothing - profile creation is handled in application code
  -- Just return NEW to allow user creation to proceed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Profile creation is also handled in application code as a fallback:
-- 1. /app/auth/callback/route.ts (for OAuth sign-ins)
-- 2. /app/api/auth/user/route.ts (for OTP sign-ins)
-- 3. /app/api/producers/register-comprehensive/route.ts (for seller registration)
