
-- Get analytics data for admin charts (daily aggregates)
CREATE OR REPLACE FUNCTION public.admin_get_analytics()
RETURNS TABLE(
  recorded_date date,
  total_purchases integer,
  total_revenue numeric,
  total_views integer
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
    SELECT a.recorded_date,
           SUM(a.purchases_count)::integer AS total_purchases,
           SUM(a.revenue_total) AS total_revenue,
           SUM(a.views_count)::integer AS total_views
    FROM public.analytics a
    GROUP BY a.recorded_date
    ORDER BY a.recorded_date ASC;
END;
$$;

-- Get summary stats for admin dashboard
CREATE OR REPLACE FUNCTION public.admin_get_summary()
RETURNS TABLE(
  total_prompts bigint,
  total_users bigint,
  total_purchases bigint,
  total_revenue numeric,
  pending_reviews bigint
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
    SELECT
      (SELECT COUNT(*) FROM public.prompts WHERE status = 'published'),
      (SELECT COUNT(*) FROM public.users),
      (SELECT COUNT(*) FROM public.purchases WHERE payment_status = 'completed'),
      COALESCE((SELECT SUM(amount_paid) FROM public.purchases WHERE payment_status = 'completed'), 0),
      (SELECT COUNT(*) FROM public.reviews WHERE is_verified = false);
END;
$$;
