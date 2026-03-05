
-- Fix security definer view by setting it to use invoker security
ALTER VIEW public.public_profiles SET (security_invoker = on);
