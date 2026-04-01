-- 1. Add RLS policies to admins table
CREATE POLICY "Admins can read own admin record" ON public.admins
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.auth_user_id = auth.uid()
        AND u.user_id = admins.user_id
    )
  );

CREATE POLICY "Deny insert on admins" ON public.admins
  FOR INSERT TO public
  WITH CHECK (false);

CREATE POLICY "Deny update on admins" ON public.admins
  FOR UPDATE TO public
  USING (false);

CREATE POLICY "Deny delete on admins" ON public.admins
  FOR DELETE TO public
  USING (false);

-- 2. Add INSERT/UPDATE/DELETE deny policies to users table
CREATE POLICY "Deny insert on users" ON public.users
  FOR INSERT TO public
  WITH CHECK (false);

CREATE POLICY "Deny update on users" ON public.users
  FOR UPDATE TO public
  USING (false);

CREATE POLICY "Deny delete on users" ON public.users
  FOR DELETE TO public
  USING (false);