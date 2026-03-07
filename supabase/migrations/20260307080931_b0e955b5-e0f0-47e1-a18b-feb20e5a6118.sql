
-- Security definer function to submit a review (only if user purchased the prompt)
-- Reviews start as is_verified = false (pending admin approval)
CREATE OR REPLACE FUNCTION public.submit_review(
  p_prompt_id integer,
  p_rating smallint,
  p_comment text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id integer;
  v_auth_id uuid;
  v_review_id integer;
BEGIN
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get marketplace user id
  SELECT user_id INTO v_user_id FROM public.users WHERE auth_user_id = v_auth_id;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Verify purchase exists
  IF NOT EXISTS (
    SELECT 1 FROM public.purchases
    WHERE buyer_id = v_user_id AND prompt_id = p_prompt_id AND payment_status = 'completed'
  ) THEN
    RAISE EXCEPTION 'You must purchase this prompt before reviewing';
  END IF;

  -- Check if already reviewed
  IF EXISTS (
    SELECT 1 FROM public.reviews
    WHERE buyer_id = v_user_id AND prompt_id = p_prompt_id
  ) THEN
    RAISE EXCEPTION 'You have already reviewed this prompt';
  END IF;

  -- Validate rating
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  -- Insert review (is_verified defaults to false, pending admin approval)
  INSERT INTO public.reviews (buyer_id, prompt_id, rating, comment, is_verified)
  VALUES (v_user_id, p_prompt_id, p_rating, p_comment, false)
  RETURNING review_id INTO v_review_id;

  RETURN v_review_id;
END;
$$;

-- Function to check if current user has already reviewed a prompt
CREATE OR REPLACE FUNCTION public.has_reviewed(p_prompt_id integer)
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
    SELECT 1 FROM public.reviews
    WHERE buyer_id = v_user_id AND prompt_id = p_prompt_id
  );
END;
$$;
