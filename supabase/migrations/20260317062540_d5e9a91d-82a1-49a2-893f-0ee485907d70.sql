
-- KYC verification tracking table
CREATE TABLE public.kyc_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  applicant_user_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'experian',
  verification_status text NOT NULL DEFAULT 'pending',
  provider_reference text,
  match_summary jsonb DEFAULT '{}'::jsonb,
  score numeric,
  decision text,
  sub_decisions jsonb DEFAULT '[]'::jsonb,
  verified_fields jsonb DEFAULT '{}'::jsonb,
  error_message text,
  request_timestamp timestamptz,
  response_timestamp timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own verifications
CREATE POLICY "Users read own kyc" ON public.kyc_verifications
  FOR SELECT TO authenticated
  USING (applicant_user_id = auth.uid() OR is_admin(auth.uid()));

-- System/edge functions can insert (via service role)
CREATE POLICY "System insert kyc" ON public.kyc_verifications
  FOR INSERT TO authenticated
  WITH CHECK (applicant_user_id = auth.uid());

-- Admins can update
CREATE POLICY "Admins update kyc" ON public.kyc_verifications
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
