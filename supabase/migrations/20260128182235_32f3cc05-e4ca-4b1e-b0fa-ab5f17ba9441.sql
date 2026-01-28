-- Add policy to allow users to update their own role during signup
-- This enables the signup flow to set admin role
CREATE POLICY "Users can update own role during signup"
ON public.user_roles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
