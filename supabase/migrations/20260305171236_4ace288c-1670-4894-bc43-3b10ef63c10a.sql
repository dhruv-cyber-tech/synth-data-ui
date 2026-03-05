
-- Add auth_user_id column to users table to link Supabase Auth users to marketplace users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE;

-- Create a security definer function to create prompts
-- This handles mapping auth users to the legacy users table automatically
CREATE OR REPLACE FUNCTION public.create_prompt(
  p_title TEXT,
  p_description TEXT,
  p_price NUMERIC,
  p_category_id INTEGER,
  p_ai_model_target TEXT,
  p_content TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id INTEGER;
  v_prompt_id INTEGER;
  v_auth_id UUID;
  v_email TEXT;
  v_username TEXT;
BEGIN
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get email from auth.users
  SELECT email INTO v_email FROM auth.users WHERE id = v_auth_id;

  -- Look up or create marketplace user
  SELECT user_id INTO v_user_id FROM public.users WHERE auth_user_id = v_auth_id;
  
  IF v_user_id IS NULL THEN
    -- Get username from profiles
    SELECT username INTO v_username FROM public.profiles WHERE id = v_auth_id;
    
    INSERT INTO public.users (username, email, password_hash, role, auth_user_id)
    VALUES (COALESCE(v_username, v_email), v_email, 'supabase_auth', 'creator', v_auth_id)
    RETURNING user_id INTO v_user_id;
  END IF;

  -- Insert prompt
  INSERT INTO public.prompts (title, description, price, category_id, ai_model_target, creator_id, status)
  VALUES (p_title, p_description, p_price, p_category_id, p_ai_model_target, v_user_id, 'published')
  RETURNING prompt_id INTO v_prompt_id;

  -- Insert initial version with content
  INSERT INTO public.prompt_versions (prompt_id, version_number, content, change_notes)
  VALUES (v_prompt_id, 1, p_content, 'Initial release');

  RETURN v_prompt_id;
END;
$$;
