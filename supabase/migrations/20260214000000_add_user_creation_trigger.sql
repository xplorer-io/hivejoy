-- =============================================================
-- Migration: Add automatic user creation trigger
-- =============================================================
-- Creates a trigger function that automatically creates entries
-- in public.users table when a new user signs up in auth.users
-- =============================================================

-- Function to automatically create a user entry when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set safe search_path to prevent injection
  SET LOCAL search_path = pg_catalog, public;
  
  INSERT INTO public.users (id, email, phone, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    'consumer', -- Default role
    'active'    -- Default status
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- Create user entries for existing auth users (if any)
-- =============================================================
-- This ensures existing users who signed up before this trigger
-- also have entries in the users table
INSERT INTO public.users (id, email, phone, role, status)
SELECT 
  id,
  email,
  phone,
  'consumer' as role,
  'active' as status
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
