
CREATE TABLE public.tracking_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider_type text NOT NULL CHECK (provider_type IN ('google_tag_manager', 'google_ads', 'meta_pixel', 'custom_script')),
  target_page text NOT NULL DEFAULT 'all',
  placement text NOT NULL DEFAULT 'head' CHECK (placement IN ('head', 'body_start', 'body_end')),
  tracking_id text,
  code_snippet text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tracking codes"
  ON public.tracking_codes FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Public can read active tracking codes"
  ON public.tracking_codes FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE TRIGGER update_tracking_codes_updated_at
  BEFORE UPDATE ON public.tracking_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
