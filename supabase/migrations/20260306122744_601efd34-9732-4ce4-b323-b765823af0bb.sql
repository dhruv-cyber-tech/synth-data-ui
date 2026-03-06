-- Recreate public_profiles view WITHOUT security_invoker so it bypasses RLS on users table
-- This is safe because the view only exposes non-sensitive columns
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
  SELECT 
    user_id,
    username,
    profile_bio,
    role,
    is_active,
    created_at
  FROM public.users;

-- Block direct SELECT on users table to protect password_hash
CREATE POLICY "Deny direct select on users"
ON public.users
FOR SELECT
USING (false);