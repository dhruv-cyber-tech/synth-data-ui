-- Drop the existing public read policy on prompt_versions
DROP POLICY IF EXISTS "Public read prompt_versions" ON public.prompt_versions;

-- Create a restrictive policy: only buyers (with completed purchase) or prompt creators can read versions
CREATE POLICY "Buyers or creators can read versions"
ON public.prompt_versions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.purchases pu
    JOIN public.users u ON u.user_id = pu.buyer_id
    WHERE u.auth_user_id = auth.uid()
      AND pu.prompt_id = prompt_versions.prompt_id
      AND pu.payment_status = 'completed'
  )
  OR EXISTS (
    SELECT 1 FROM public.prompts p
    JOIN public.users u ON u.user_id = p.creator_id
    WHERE u.auth_user_id = auth.uid()
      AND p.prompt_id = prompt_versions.prompt_id
  )
);