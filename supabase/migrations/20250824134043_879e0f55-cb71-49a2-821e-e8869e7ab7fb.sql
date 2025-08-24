-- Fix critical security vulnerability in users table RLS policies
-- Remove overly permissive policies that allow public access to user data

-- Drop the insecure policies that allow public access
DROP POLICY IF EXISTS "Allow user login" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;  
DROP POLICY IF EXISTS "Allow user updates" ON public.users;

-- Keep only the secure policies that restrict access to own data
-- (These should already exist, but let's ensure they're properly set)

-- Ensure users can only view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Ensure users can only update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Allow new user registration (but only with proper user_id matching auth.uid())
CREATE POLICY "Users can register their own account" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- No DELETE policy - users cannot delete their own accounts
-- Only admins should be able to delete users through admin functions