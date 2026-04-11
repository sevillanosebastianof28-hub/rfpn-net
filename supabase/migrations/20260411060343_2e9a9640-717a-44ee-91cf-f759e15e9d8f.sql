
-- 1. Add 'affiliate' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'affiliate';

-- 2. Create affiliates table
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  affiliate_code text NOT NULL UNIQUE,
  custom_slug text UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  payout_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates read own" ON public.affiliates FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins manage affiliates" ON public.affiliates FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can insert own affiliate" ON public.affiliates FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Create affiliate_clicks table
CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  landing_url text,
  user_agent text,
  ip_hash text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates read own clicks" ON public.affiliate_clicks FOR SELECT TO authenticated
  USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Anyone can insert clicks" ON public.affiliate_clicks FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 4. Create affiliate_conversions table
CREATE TABLE public.affiliate_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL,
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'flagged')),
  commission_amount numeric NOT NULL DEFAULT 50,
  flag_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  paid_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates read own conversions" ON public.affiliate_conversions FOR SELECT TO authenticated
  USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "System insert conversions" ON public.affiliate_conversions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins manage conversions" ON public.affiliate_conversions FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_conversions_updated_at BEFORE UPDATE ON public.affiliate_conversions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Create affiliate_payouts table
CREATE TABLE public.affiliate_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text,
  transaction_reference text,
  note text,
  processed_by_admin_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates read own payouts" ON public.affiliate_payouts FOR SELECT TO authenticated
  USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Admins insert payouts" ON public.affiliate_payouts FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- 6. Add referral columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_affiliate_id uuid REFERENCES public.affiliates(id);

-- 7. Add affiliate_id to applications
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.affiliates(id);

-- 8. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_clicks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_conversions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_payouts;
