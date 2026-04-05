-- 1. moderation_log: Admin-only SELECT, deny all writes
CREATE POLICY "Admins can read moderation log" ON public.moderation_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins a
      JOIN public.users u ON u.user_id = a.user_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Deny insert on moderation_log" ON public.moderation_log
  FOR INSERT TO public
  WITH CHECK (false);

CREATE POLICY "Deny update on moderation_log" ON public.moderation_log
  FOR UPDATE TO public
  USING (false);

CREATE POLICY "Deny delete on moderation_log" ON public.moderation_log
  FOR DELETE TO public
  USING (false);

-- 2. analytics: Restrict to admin-only reads
DROP POLICY IF EXISTS "Public read analytics" ON public.analytics;

CREATE POLICY "Admins can read analytics" ON public.analytics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins a
      JOIN public.users u ON u.user_id = a.user_id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- 3. prompts: Restrict public reads to published only, creators see own
DROP POLICY IF EXISTS "Public read prompts" ON public.prompts;

CREATE POLICY "Public read published prompts" ON public.prompts
  FOR SELECT TO public
  USING (status = 'published');

CREATE POLICY "Creators read own prompts" ON public.prompts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.auth_user_id = auth.uid()
        AND u.user_id = prompts.creator_id
    )
  );