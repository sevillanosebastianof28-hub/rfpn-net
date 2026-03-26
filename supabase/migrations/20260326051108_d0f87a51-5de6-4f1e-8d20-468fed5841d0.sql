
-- Drop and recreate the SELECT policy to include broker_email match
DROP POLICY IF EXISTS "Developers read own apps" ON public.applications;
CREATE POLICY "Developers read own apps" ON public.applications
  FOR SELECT TO authenticated
  USING (
    developer_id = auth.uid()
    OR assigned_broker_id = auth.uid()
    OR is_admin(auth.uid())
    OR broker_email = (SELECT email FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
  );

-- Also update the UPDATE policy
DROP POLICY IF EXISTS "App owners and admins can update" ON public.applications;
CREATE POLICY "App owners and admins can update" ON public.applications
  FOR UPDATE TO authenticated
  USING (
    developer_id = auth.uid()
    OR assigned_broker_id = auth.uid()
    OR is_admin(auth.uid())
    OR broker_email = (SELECT email FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
  );
