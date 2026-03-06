DROP FUNCTION IF EXISTS public.create_prompt(text, text, numeric, integer, text, text);
DROP FUNCTION IF EXISTS public.create_prompt(character varying, text, numeric, integer, character varying, text);

CREATE OR REPLACE FUNCTION public.create_prompt(
  p_title text,
  p_description text,
  p_price numeric,
  p_category_id integer,
  p_ai_model_target text,
  p_content text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id integer;
  v_prompt_id integer;
  v_auth_id uuid;
  v_email text;
  v_username text;
BEGIN
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_auth_id;

  SELECT user_id INTO v_user_id
  FROM public.users
  WHERE auth_user_id = v_auth_id;

  IF v_user_id IS NULL THEN
    SELECT username INTO v_username FROM public.profiles WHERE id = v_auth_id;

    INSERT INTO public.users (username, email, password_hash, role, auth_user_id)
    VALUES (COALESCE(v_username, v_email), v_email, 'supabase_auth', 'creator', v_auth_id)
    RETURNING user_id INTO v_user_id;
  END IF;

  INSERT INTO public.prompts (title, description, price, category_id, ai_model_target, creator_id, status)
  VALUES (p_title, p_description, p_price, p_category_id, p_ai_model_target, v_user_id, 'published')
  RETURNING prompt_id INTO v_prompt_id;

  -- Initial version is created by trigger trg_create_initial_version / fn_create_initial_version.
  -- Keep p_content parameter for API compatibility.

  RETURN v_prompt_id;
END;
$function$;