CREATE OR REPLACE FUNCTION public.get_current_marketplace_user_id()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.user_id
  FROM public.users u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.can_access_prompt_content(p_prompt_id integer)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id integer;
BEGIN
  v_user_id := public.get_current_marketplace_user_id();

  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.purchases pu
    WHERE pu.buyer_id = v_user_id
      AND pu.prompt_id = p_prompt_id
      AND pu.payment_status = 'completed'
  ) OR EXISTS (
    SELECT 1
    FROM public.prompts p
    WHERE p.prompt_id = p_prompt_id
      AND p.creator_id = v_user_id
  );
END;
$$;

DROP POLICY IF EXISTS "Buyers or creators can read versions" ON public.prompt_versions;

CREATE POLICY "Authorized users can read prompt versions"
ON public.prompt_versions
FOR SELECT
TO authenticated
USING (public.can_access_prompt_content(prompt_id));