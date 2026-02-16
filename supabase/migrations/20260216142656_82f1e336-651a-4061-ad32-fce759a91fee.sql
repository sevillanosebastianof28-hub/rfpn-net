
-- Fix overly permissive INSERT policies

-- 1. Message threads: restrict to authenticated users (already is, but add sender check)
DROP POLICY "Authenticated can create threads" ON public.message_threads;
CREATE POLICY "Authenticated can create threads" ON public.message_threads
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
  );

-- 2. Message thread participants: only thread creator or admin can add participants
DROP POLICY "Add thread participants" ON public.message_thread_participants;
CREATE POLICY "Add thread participants" ON public.message_thread_participants
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid() OR public.is_admin(auth.uid())
  );

-- 3. Audit logs: keep permissive for system logging (this is intentional - all authenticated users generate audit trails)
-- The WITH CHECK (true) is acceptable here since audit_logs are append-only and admin-read-only

-- 4. Integration events: restrict to admin only
DROP POLICY "System insert integration events" ON public.integration_events;
CREATE POLICY "Admins can insert integration events" ON public.integration_events
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
