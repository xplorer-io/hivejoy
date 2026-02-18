-- Add DELETE policy for batches
-- Producers can delete their own batches

DROP POLICY IF EXISTS "Producers can delete own batches" ON public.batches;
CREATE POLICY "Producers can delete own batches" ON public.batches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.producers
      WHERE producers.id = batches.producer_id
      AND producers.user_id = auth.uid()
    )
  );
