-- Allow all authenticated users to read profiles (needed for social feed, messages, etc.)
CREATE POLICY "All authenticated can read profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop the restrictive user-only read policy (the new one covers it)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;