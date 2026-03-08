
-- Check if current auth user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id integer;
BEGIN
  SELECT u.user_id INTO v_user_id FROM public.users u WHERE u.auth_user_id = auth.uid();
  IF v_user_id IS NULL THEN RETURN false; END IF;
  RETURN EXISTS (SELECT 1 FROM public.admins WHERE user_id = v_user_id);
END;
$$;

-- Get all pending (unverified) reviews for admin moderation
CREATE OR REPLACE FUNCTION public.admin_get_pending_reviews()
RETURNS TABLE(
  review_id integer,
  prompt_id integer,
  prompt_title varchar,
  buyer_id integer,
  buyer_username varchar,
  rating smallint,
  comment text,
  created_at timestamp
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id integer;
BEGIN
  SELECT u.user_id INTO v_user_id FROM public.users u WHERE u.auth_user_id = auth.uid();
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    SELECT r.review_id, r.prompt_id, p.title AS prompt_title, r.buyer_id,
           u2.username AS buyer_username, r.rating, r.comment, r.created_at
    FROM public.reviews r
    JOIN public.prompts p ON p.prompt_id = r.prompt_id
    JOIN public.users u2 ON u2.user_id = r.buyer_id
    WHERE r.is_verified = false
    ORDER BY r.created_at ASC;
END;
$$;

-- Approve a review
CREATE OR REPLACE FUNCTION public.admin_approve_review(p_review_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id integer;
BEGIN
  SELECT u.user_id INTO v_user_id FROM public.users u WHERE u.auth_user_id = auth.uid();
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.reviews SET is_verified = true WHERE review_id = p_review_id;
END;
$$;

-- Reject (delete) a review
CREATE OR REPLACE FUNCTION public.admin_reject_review(p_review_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id integer;
BEGIN
  SELECT u.user_id INTO v_user_id FROM public.users u WHERE u.auth_user_id = auth.uid();
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM public.reviews WHERE review_id = p_review_id;
END;
$$;

-- Get all prompts for admin moderation
CREATE OR REPLACE FUNCTION public.admin_get_prompts()
RETURNS TABLE(
  prompt_id integer,
  title varchar,
  description text,
  price numeric,
  status varchar,
  created_at timestamp,
  creator_username varchar,
  ai_model_target varchar
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
           u2.username AS creator_username, p.ai_model_target
    FROM public.prompts p
    JOIN public.users u2 ON u2.user_id = p.creator_id
    ORDER BY p.created_at DESC;
END;
$$;

-- Update prompt status (publish/remove/draft)
CREATE OR REPLACE FUNCTION public.admin_update_prompt_status(p_prompt_id integer, p_status varchar)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id integer;
BEGIN
  SELECT u.user_id INTO v_user_id FROM public.users u WHERE u.auth_user_id = auth.uid();
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_status NOT IN ('published', 'removed', 'draft') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.prompts SET status = p_status WHERE prompt_id = p_prompt_id;
END;
$$;
