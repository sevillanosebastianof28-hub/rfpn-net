
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can update (mark read) their own notifications
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- System/service can insert notifications (any authenticated user via triggers)
CREATE POLICY "System insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function: notify admins on submission
CREATE OR REPLACE FUNCTION public.notify_on_submission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND (OLD.status IS DISTINCT FROM 'submitted') THEN
    INSERT INTO public.notifications (user_id, application_id, type, title, message)
    SELECT ur.user_id, NEW.id, 'submission',
      'New Application Submitted',
      'Application "' || NEW.title || '" has been submitted.'
    FROM public.user_roles ur
    WHERE ur.role IN ('super_admin', 'central_admin');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger function: notify broker on assignment
CREATE OR REPLACE FUNCTION public.notify_on_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_broker_id IS NOT NULL AND NEW.assigned_broker_id IS DISTINCT FROM OLD.assigned_broker_id THEN
    INSERT INTO public.notifications (user_id, application_id, type, title, message)
    VALUES (
      NEW.assigned_broker_id, NEW.id, 'assignment',
      'Application Assigned to You',
      'Application "' || NEW.title || '" has been assigned to you.'
    );
  END IF;
  -- Notify on allocation via broker_email
  IF NEW.status = 'allocated' AND OLD.status IS DISTINCT FROM 'allocated' AND NEW.broker_email IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, application_id, type, title, message)
    SELECT p.user_id, NEW.id, 'allocation',
      'New Application Allocated',
      'Application "' || NEW.title || '" has been allocated to you.'
    FROM public.profiles p
    WHERE p.email = NEW.broker_email
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach triggers
CREATE TRIGGER trg_notify_on_submission
  AFTER UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_submission();

CREATE TRIGGER trg_notify_on_assignment
  AFTER UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_assignment();

-- Audit trigger for status changes
CREATE OR REPLACE FUNCTION public.audit_application_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      CASE
        WHEN NEW.status = 'submitted' THEN 'application_submitted'
        WHEN NEW.status = 'allocated' THEN 'application_allocated'
        ELSE 'application_status_change'
      END,
      'application',
      NEW.id::text,
      'Status changed from ' || OLD.status || ' to ' || NEW.status
    );
  END IF;
  IF NEW.assigned_broker_id IS DISTINCT FROM OLD.assigned_broker_id THEN
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
    VALUES (auth.uid(), 'application_assigned', 'application', NEW.id::text,
      'Assigned to broker ' || COALESCE(NEW.assigned_broker_id::text, 'none'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_audit_application_changes
  AFTER UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.audit_application_changes();
