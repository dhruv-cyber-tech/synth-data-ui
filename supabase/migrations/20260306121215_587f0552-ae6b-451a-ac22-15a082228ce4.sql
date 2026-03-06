
CREATE OR REPLACE FUNCTION public.create_prompt(
  p_title character varying,
  p_description text,
  p_price numeric,
  p_category_id integer,
  p_ai_model_target character varying,
  p_content text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id integer;
  v_prompt_id integer;
  v_next_version integer;
BEGIN
  -- Find or create user mapping
  SELECT user_id INTO v_user_id
  FROM users
  WHERE auth_user_id = auth.uid();

  IF v_user_id IS NULL THEN
    INSERT INTO users (auth_user_id, username, email, password_hash)
    VALUES (
      auth.uid(),
      COALESCE((SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = auth.uid()), 'user_' || substr(auth.uid()::text, 1, 8)),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      'managed_by_supabase_auth'
    )
    RETURNING user_id INTO v_user_id;
  END IF;

  -- Insert the prompt
  INSERT INTO prompts (creator_id, category_id, title, description, price, ai_model_target, status)
  VALUES (v_user_id, p_category_id, p_title, p_description, p_price, p_ai_model_target, 'published')
  RETURNING prompt_id INTO v_prompt_id;

  -- Get the next version number for this prompt
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
  FROM prompt_versions
  WHERE prompt_id = v_prompt_id;

  -- Insert version
  INSERT INTO prompt_versions (prompt_id, version_number, content, change_notes)
  VALUES (v_prompt_id, v_next_version, p_content, 'Initial version');

  RETURN v_prompt_id;
END;
$$;
