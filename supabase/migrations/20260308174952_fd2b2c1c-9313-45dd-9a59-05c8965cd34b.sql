-- Fix 1: Drop and recreate public_profiles view without role/is_active
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
  SELECT user_id, username, profile_bio, created_at
  FROM public.users;

ALTER VIEW public.public_profiles SET (security_invoker = on);

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Fix 2: Update functions that reference password_hash

CREATE OR REPLACE FUNCTION public.purchase_prompt(p_prompt_id integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id integer;
  v_auth_id uuid;
  v_price numeric;
  v_purchase_id integer;
  v_email text;
  v_username text;
BEGIN
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id INTO v_user_id FROM public.users WHERE auth_user_id = v_auth_id;

  IF v_user_id IS NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = v_auth_id;
    SELECT username INTO v_username FROM public.profiles WHERE id = v_auth_id;

    INSERT INTO public.users (username, email, role, auth_user_id)
    VALUES (COALESCE(v_username, v_email), v_email, 'buyer', v_auth_id)
    RETURNING user_id INTO v_user_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.purchases
    WHERE buyer_id = v_user_id AND prompt_id = p_prompt_id AND payment_status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Already purchased';
  END IF;

  SELECT price INTO v_price FROM public.prompts WHERE prompt_id = p_prompt_id AND status = 'published';
  IF v_price IS NULL THEN
    RAISE EXCEPTION 'Prompt not found';
  END IF;

  INSERT INTO public.purchases (buyer_id, prompt_id, amount_paid, payment_status)
  VALUES (v_user_id, p_prompt_id, v_price, 'completed')
  RETURNING purchase_id INTO v_purchase_id;

  RETURN v_purchase_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_prompt(p_title text, p_description text, p_price numeric, p_category_id integer, p_ai_model_target text, p_content text)
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

  SELECT user_id INTO v_user_id FROM public.users WHERE auth_user_id = v_auth_id;

  IF v_user_id IS NULL THEN
    SELECT username INTO v_username FROM public.profiles WHERE id = v_auth_id;

    INSERT INTO public.users (username, email, role, auth_user_id)
    VALUES (COALESCE(v_username, v_email), v_email, 'creator', v_auth_id)
    RETURNING user_id INTO v_user_id;
  END IF;

  INSERT INTO public.prompts (title, description, price, category_id, ai_model_target, creator_id, status)
  VALUES (p_title, p_description, p_price, p_category_id, p_ai_model_target, v_user_id, 'published')
  RETURNING prompt_id INTO v_prompt_id;

  RETURN v_prompt_id;
END;
$function$;

-- Now drop the password_hash column
ALTER TABLE public.users DROP COLUMN password_hash;