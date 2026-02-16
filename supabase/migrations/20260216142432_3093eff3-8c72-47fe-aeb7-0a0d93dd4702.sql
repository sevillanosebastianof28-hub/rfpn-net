
-- ============================================
-- RELEY FAST PROPERTY NETWORK - FULL SCHEMA
-- ============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin', 'central_admin', 'developer', 'broker');
CREATE TYPE public.verification_status AS ENUM ('not_started', 'in_progress', 'passed', 'failed', 'manual_review');
CREATE TYPE public.application_status AS ENUM ('draft', 'submitted', 'under_review', 'info_requested', 'approved', 'declined', 'completed');
CREATE TYPE public.integration_status AS ENUM ('queued', 'sent', 'failed', 'resent');

-- 2. HELPER: updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  tenant_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. USER ROLES TABLE (critical: separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. SECURITY DEFINER FUNCTIONS (prevent recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'central_admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 6. TENANTS (Contacts/Clients)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#1a365d',
  secondary_color TEXT NOT NULL DEFAULT '#2d3748',
  portal_name TEXT,
  email_template_branding JSONB DEFAULT '{}',
  verification_requirements JSONB DEFAULT '{}',
  application_template JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add FK from profiles to tenants
ALTER TABLE public.profiles ADD CONSTRAINT profiles_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;

-- 7. DEVELOPER PROFILES (extended profile for credit applications)
CREATE TABLE public.developer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  company_registration_number TEXT,
  company_address TEXT,
  years_experience INTEGER,
  project_history JSONB DEFAULT '[]',
  verification_status verification_status NOT NULL DEFAULT 'not_started',
  verification_completed_at TIMESTAMPTZ,
  kyc_status verification_status NOT NULL DEFAULT 'not_started',
  kyc_checked_at TIMESTAMPTZ,
  terms_accepted_at TIMESTAMPTZ,
  consent_captured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.developer_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_developer_profiles_updated_at BEFORE UPDATE ON public.developer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. APPLICATIONS
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  developer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_broker_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'draft',
  project_details JSONB DEFAULT '{}',
  funding_requirements JSONB DEFAULT '{}',
  financial_statements JSONB DEFAULT '{}',
  amount NUMERIC(15,2),
  type TEXT NOT NULL DEFAULT 'development_funding',
  status_timeline JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. DOCUMENTS
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  profile_link BOOLEAN DEFAULT false,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'other',
  is_encrypted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 10. MESSAGE THREADS
CREATE TABLE public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  subject TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON public.message_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 12. MESSAGE THREAD PARTICIPANTS
CREATE TABLE public.message_thread_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE (thread_id, user_id)
);
ALTER TABLE public.message_thread_participants ENABLE ROW LEVEL SECURITY;

-- 13. SOCIAL POSTS (Internal feed)
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id),
  content TEXT NOT NULL,
  image_url TEXT,
  watermark_enabled BOOLEAN DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'tenant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 15. INTEGRATION EVENTS (JAG Finance)
CREATE TABLE public.integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  target TEXT NOT NULL DEFAULT 'jag_finance',
  status integration_status NOT NULL DEFAULT 'queued',
  payload JSONB DEFAULT '{}',
  response JSONB,
  retry_count INTEGER DEFAULT 0,
  last_attempted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_integration_events_updated_at BEFORE UPDATE ON public.integration_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16. FAQ TABLE (for chatbot)
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- PROFILES: Users read own, admins read all
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- USER ROLES: Admins manage, users read own
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- TENANTS: Admins manage, authenticated read active
CREATE POLICY "Authenticated can read active tenants" ON public.tenants
  FOR SELECT TO authenticated USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert tenants" ON public.tenants
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update tenants" ON public.tenants
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete tenants" ON public.tenants
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- DEVELOPER PROFILES: Own or admin
CREATE POLICY "Developers read own profile" ON public.developer_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Developers can insert own" ON public.developer_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Developers can update own" ON public.developer_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- APPLICATIONS: Developer sees own, broker sees assigned, admin sees all
CREATE POLICY "Developers read own apps" ON public.applications
  FOR SELECT TO authenticated USING (
    developer_id = auth.uid() OR assigned_broker_id = auth.uid() OR public.is_admin(auth.uid())
  );
CREATE POLICY "Developers can insert apps" ON public.applications
  FOR INSERT TO authenticated WITH CHECK (developer_id = auth.uid());
CREATE POLICY "App owners and admins can update" ON public.applications
  FOR UPDATE TO authenticated USING (
    developer_id = auth.uid() OR assigned_broker_id = auth.uid() OR public.is_admin(auth.uid())
  );

-- DOCUMENTS: Owner, app participants, or admin
CREATE POLICY "Document access" ON public.documents
  FOR SELECT TO authenticated USING (
    owner_id = auth.uid() OR public.is_admin(auth.uid())
  );
CREATE POLICY "Users can upload docs" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can delete own docs" ON public.documents
  FOR DELETE TO authenticated USING (owner_id = auth.uid() OR public.is_admin(auth.uid()));

-- MESSAGE THREADS: Participants only
CREATE POLICY "Thread participants can read" ON public.message_threads
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.message_thread_participants WHERE thread_id = id AND user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );
CREATE POLICY "Authenticated can create threads" ON public.message_threads
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Thread update" ON public.message_threads
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.message_thread_participants WHERE thread_id = id AND user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

-- MESSAGES
CREATE POLICY "Message read access" ON public.messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.message_thread_participants WHERE thread_id = messages.thread_id AND user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );
CREATE POLICY "Send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- MESSAGE THREAD PARTICIPANTS
CREATE POLICY "Read thread participants" ON public.message_thread_participants
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.is_admin(auth.uid())
  );
CREATE POLICY "Add thread participants" ON public.message_thread_participants
  FOR INSERT TO authenticated WITH CHECK (true);

-- SOCIAL POSTS: Tenant-scoped or platform-wide
CREATE POLICY "Read social posts" ON public.social_posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Create social posts" ON public.social_posts
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Update own posts" ON public.social_posts
  FOR UPDATE TO authenticated USING (author_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Delete own posts" ON public.social_posts
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.is_admin(auth.uid()));

-- AUDIT LOGS: Admin only
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- INTEGRATION EVENTS: Admin only
CREATE POLICY "Admins can read integration events" ON public.integration_events
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "System insert integration events" ON public.integration_events
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update integration events" ON public.integration_events
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- FAQS: Public read, admin manage
CREATE POLICY "Anyone can read active FAQs" ON public.faqs
  FOR SELECT TO authenticated USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert FAQs" ON public.faqs
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update FAQs" ON public.faqs
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete FAQs" ON public.faqs
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('tenant-assets', 'tenant-assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('social-media', 'social-media', true);

-- Storage policies
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can read own documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())));
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Avatar read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Tenant assets read" ON storage.objects
  FOR SELECT USING (bucket_id = 'tenant-assets');
CREATE POLICY "Admin upload tenant assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tenant-assets' AND public.is_admin(auth.uid()));

CREATE POLICY "Social media upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'social-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Social media read" ON storage.objects
  FOR SELECT USING (bucket_id = 'social-media');

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  -- Default role is developer unless specified
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::app_role,
      'developer'::app_role
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
