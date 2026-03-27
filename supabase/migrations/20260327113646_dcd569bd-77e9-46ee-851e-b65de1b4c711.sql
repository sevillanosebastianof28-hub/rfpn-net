-- Fix message_threads RLS policies - they incorrectly reference message_thread_participants.id instead of message_threads.id

DROP POLICY IF EXISTS "Thread participants can read" ON public.message_threads;
DROP POLICY IF EXISTS "Thread update" ON public.message_threads;

CREATE POLICY "Thread participants can read"
ON public.message_threads FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM message_thread_participants
    WHERE message_thread_participants.thread_id = message_threads.id
    AND message_thread_participants.user_id = auth.uid()
  )) OR is_admin(auth.uid())
);

CREATE POLICY "Thread update"
ON public.message_threads FOR UPDATE
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM message_thread_participants
    WHERE message_thread_participants.thread_id = message_threads.id
    AND message_thread_participants.user_id = auth.uid()
  )) OR is_admin(auth.uid())
);

-- Fix documents RLS - allow brokers to view documents on their assigned applications
DROP POLICY IF EXISTS "Document access" ON public.documents;
CREATE POLICY "Document access"
ON public.documents FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = documents.application_id
    AND (
      applications.assigned_broker_id = auth.uid()
      OR applications.broker_email = (
        SELECT profiles.email FROM profiles WHERE profiles.user_id = auth.uid() LIMIT 1
      )
    )
  )
);