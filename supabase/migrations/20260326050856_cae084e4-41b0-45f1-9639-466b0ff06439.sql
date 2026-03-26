
-- Add 'allocated' to application_status enum
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'allocated' AFTER 'completed';

-- Add broker allocation fields to applications table
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS broker_name text,
  ADD COLUMN IF NOT EXISTS broker_email text,
  ADD COLUMN IF NOT EXISTS allocated_at timestamptz,
  ADD COLUMN IF NOT EXISTS allocated_by uuid;
