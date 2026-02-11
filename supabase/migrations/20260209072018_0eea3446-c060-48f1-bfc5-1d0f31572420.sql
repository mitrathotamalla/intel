
-- Drop the restrictive profiles SELECT policy
DROP POLICY "Users can view own profile" ON public.profiles;

-- Create a new policy that allows all authenticated users to view profiles
-- (profiles only contain non-sensitive data: name, department, year, college, avatar_url)
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
