-- Migration: Add RLS policy for admins to view all producers
-- This allows admins to see all producer applications for review

-- Admins can view all producers (for reviewing applications)
DROP POLICY IF EXISTS "Admins can view all producers" ON public.producers;
CREATE POLICY "Admins can view all producers" ON public.producers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all producers (for approving/rejecting applications)
DROP POLICY IF EXISTS "Admins can update all producers" ON public.producers;
CREATE POLICY "Admins can update all producers" ON public.producers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
