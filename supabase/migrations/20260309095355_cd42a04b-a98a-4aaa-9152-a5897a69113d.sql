
DROP FUNCTION IF EXISTS public.admin_get_prompts();

CREATE OR REPLACE FUNCTION public.admin_get_prompts()
RETURNS TABLE(
  prompt_id integer,
  title character varying,
  description text,
  price numeric,
  status character varying,
  created_at timestamp without time zone,
  creator_username character varying,
  ai_model_target character varying,
  suggested_category text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id integer;
BEGIN
  SELECT u.user_id INTO v_user_id FROM public.users u WHERE u.auth_user_id = auth.uid();
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    SELECT p.prompt_id, p.title, p.description, p.price, p.status, p.created_at,
           u2.username AS creator_username, p.ai_model_target, p.suggested_category
    FROM public.prompts p
    JOIN public.users u2 ON u2.user_id = p.creator_id
    ORDER BY
      CASE WHEN p.status = 'pending' THEN 0 ELSE 1 END,
      p.created_at DESC;
END;
$$;
