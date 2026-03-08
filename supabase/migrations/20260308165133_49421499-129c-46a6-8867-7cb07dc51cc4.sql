
-- Function to get the current user's published prompts
CREATE OR REPLACE FUNCTION public.get_my_prompts()
RETURNS TABLE(prompt_id integer, title varchar, description text, price numeric, status varchar, created_at timestamp, ai_model_target varchar)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id integer;
BEGIN
  SELECT u.user_id INTO v_user_id FROM public.users u WHERE u.auth_user_id = auth.uid();
  IF v_user_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
    SELECT p.prompt_id, p.title, p.description, p.price, p.status, p.created_at, p.ai_model_target
    FROM public.prompts p
    WHERE p.creator_id = v_user_id
    ORDER BY p.created_at DESC;
END;
$$;

-- Function to get the current user's purchases with prompt titles
CREATE OR REPLACE FUNCTION public.get_my_purchases()
RETURNS TABLE(purchase_id integer, prompt_id integer, prompt_title varchar, amount_paid numeric, purchased_at timestamp, payment_status varchar)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id integer;
BEGIN
  SELECT u.user_id INTO v_user_id FROM public.users u WHERE u.auth_user_id = auth.uid();
  IF v_user_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
    SELECT pu.purchase_id, pu.prompt_id, pr.title AS prompt_title, pu.amount_paid, pu.purchased_at, pu.payment_status
    FROM public.purchases pu
    JOIN public.prompts pr ON pr.prompt_id = pu.prompt_id
    WHERE pu.buyer_id = v_user_id
    ORDER BY pu.purchased_at DESC;
END;
$$;
