
-- Security definer function to handle mock purchases
CREATE OR REPLACE FUNCTION public.purchase_prompt(p_prompt_id integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Get or create marketplace user
  SELECT user_id INTO v_user_id FROM public.users WHERE auth_user_id = v_auth_id;

  IF v_user_id IS NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = v_auth_id;
    SELECT username INTO v_username FROM public.profiles WHERE id = v_auth_id;

    INSERT INTO public.users (username, email, password_hash, role, auth_user_id)
    VALUES (COALESCE(v_username, v_email), v_email, 'supabase_auth', 'buyer', v_auth_id)
    RETURNING user_id INTO v_user_id;
  END IF;

  -- Check if already purchased
  IF EXISTS (
    SELECT 1 FROM public.purchases
    WHERE buyer_id = v_user_id AND prompt_id = p_prompt_id AND payment_status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Already purchased';
  END IF;

  -- Get prompt price
  SELECT price INTO v_price FROM public.prompts WHERE prompt_id = p_prompt_id AND status = 'published';
  IF v_price IS NULL THEN
    RAISE EXCEPTION 'Prompt not found';
  END IF;

  -- Insert purchase (mock - instant completed)
  INSERT INTO public.purchases (buyer_id, prompt_id, amount_paid, payment_status)
  VALUES (v_user_id, p_prompt_id, v_price, 'completed')
  RETURNING purchase_id INTO v_purchase_id;

  RETURN v_purchase_id;
END;
$$;

-- Function to check if current user has purchased a prompt
CREATE OR REPLACE FUNCTION public.has_purchased(p_prompt_id integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id integer;
BEGIN
  SELECT user_id INTO v_user_id FROM public.users WHERE auth_user_id = auth.uid();
  IF v_user_id IS NULL THEN RETURN false; END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.purchases
    WHERE buyer_id = v_user_id AND prompt_id = p_prompt_id AND payment_status = 'completed'
  );
END;
$$;
