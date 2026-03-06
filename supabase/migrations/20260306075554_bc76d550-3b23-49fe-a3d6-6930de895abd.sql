
-- Add document_date to documents table for tracking document age
ALTER TABLE public.documents ADD COLUMN document_date date;

-- Add e-signature fields to applications table
ALTER TABLE public.applications ADD COLUMN signature_data text;
ALTER TABLE public.applications ADD COLUMN signed_at timestamp with time zone;
ALTER TABLE public.applications ADD COLUMN signer_ip text;
