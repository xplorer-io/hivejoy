-- Add DELETE policy for batches and indexes for RLS performance
-- Producers can delete their own batches

BEGIN;

CREATE INDEX IF NOT EXISTS idx_batches_producer_id ON public.batches(producer_id);
CREATE INDEX IF NOT EXISTS idx_producers_user_id ON public.producers(user_id);

DROP POLICY IF EXISTS "Producers can delete own batches" ON public.batches;
CREATE POLICY "Producers can delete own batches" ON public.batches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.producers
      WHERE producers.id = batches.producer_id
      AND producers.user_id = auth.uid()
    )
  );

COMMIT;
