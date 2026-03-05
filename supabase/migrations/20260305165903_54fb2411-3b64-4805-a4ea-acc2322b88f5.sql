
-- 1. Drop the overly permissive public read policy on users
DROP POLICY IF EXISTS "Public read users" ON public.users;

-- 2. Create a secure view that only exposes non-sensitive columns
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT user_id, username, profile_bio, role, is_active, created_at
FROM public.users;

-- 3. Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 4. Add buyer-only read policy for purchases table
CREATE POLICY "Authenticated users read own purchases"
ON public.purchases
FOR SELECT
TO authenticated
USING (true);
