
-- Add suggested_category column to prompts for custom category names
ALTER TABLE public.prompts ADD COLUMN suggested_category text DEFAULT NULL;

-- Update create_prompt function to accept optional suggested category
CREATE OR REPLACE FUNCTION public.create_prompt(
  p_title text,
  p_description text,
  p_price numeric,
  p_category_id integer,
  p_ai_model_target text,
  p_content text,
  p_suggested_category text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id integer;
  v_prompt_id integer;
  v_auth_id uuid;
  v_email text;
  v_username text;
  v_status character varying;
BEGIN
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_auth_id;
  SELECT user_id INTO v_user_id FROM public.users WHERE auth_user_id = v_auth_id;

  IF v_user_id IS NULL THEN
    SELECT username INTO v_username FROM public.profiles WHERE id = v_auth_id;
    INSERT INTO public.users (username, email, role, auth_user_id)
    VALUES (COALESCE(v_username, v_email), v_email, 'creator', v_auth_id)
    RETURNING user_id INTO v_user_id;
  END IF;

  -- If suggested_category is provided, set status to 'pending' for admin review
  IF p_suggested_category IS NOT NULL AND trim(p_suggested_category) != '' THEN
    v_status := 'pending';
  ELSE
    v_status := 'published';
  END IF;

  INSERT INTO public.prompts (title, description, price, category_id, ai_model_target, creator_id, status, suggested_category)
  VALUES (p_title, p_description, p_price, p_category_id, p_ai_model_target, v_user_id, v_status, p_suggested_category)
  RETURNING prompt_id INTO v_prompt_id;

  RETURN v_prompt_id;
END;
$$;
