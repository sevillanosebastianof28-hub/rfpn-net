
-- 1. affiliate_settings table
CREATE TABLE public.affiliate_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_per_lead numeric NOT NULL DEFAULT 100,
  currency text NOT NULL DEFAULT 'GBP',
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage affiliate settings"
  ON public.affiliate_settings FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Authenticated can read affiliate settings"
  ON public.affiliate_settings FOR SELECT
  TO authenticated
  USING (true);

-- Seed default row
INSERT INTO public.affiliate_settings (payout_per_lead, currency) VALUES (100, 'GBP');

-- 2. affiliate_withdrawal_requests table
CREATE TABLE public.affiliate_withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_method text,
  payment_details jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  transaction_reference text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  paid_at timestamp with time zone,
  processed_by_admin_id uuid
);

ALTER TABLE public.affiliate_withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates read own withdrawal requests"
  ON public.affiliate_withdrawal_requests FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Affiliates create own withdrawal requests"
  ON public.affiliate_withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins update withdrawal requests"
  ON public.affiliate_withdrawal_requests FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- 3. Add columns to affiliate_conversions
ALTER TABLE public.affiliate_conversions
  ADD COLUMN IF NOT EXISTS lead_payout_value numeric,
  ADD COLUMN IF NOT EXISTS qualified_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS rejected_reason text,
  ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- 4. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_withdrawal_requests;
