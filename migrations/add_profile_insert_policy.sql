-- Migration: Add INSERT policy for profiles table
-- This allows users to create their own profile if it doesn't exist
-- (backup in case the trigger doesn't fire)

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
