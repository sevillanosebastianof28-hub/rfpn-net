
-- Add Credas tracking columns to developer_profiles
ALTER TABLE public.developer_profiles
  ADD COLUMN IF NOT EXISTS credas_process_id text,
  ADD COLUMN IF NOT EXISTS credas_entity_id text,
  ADD COLUMN IF NOT EXISTS credas_journey_id text;

-- Index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_dev_profiles_credas_process ON public.developer_profiles (credas_process_id) WHERE credas_process_id IS NOT NULL;
