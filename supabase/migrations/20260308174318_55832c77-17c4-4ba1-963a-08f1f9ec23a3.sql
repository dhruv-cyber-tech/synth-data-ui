-- Fix: restrict purchases SELECT to only the buyer's own rows
DROP POLICY IF EXISTS "Authenticated users read own purchases" ON public.purchases;

CREATE POLICY "Users can read own purchases"
ON public.purchases FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND u.user_id = purchases.buyer_id
  )
);