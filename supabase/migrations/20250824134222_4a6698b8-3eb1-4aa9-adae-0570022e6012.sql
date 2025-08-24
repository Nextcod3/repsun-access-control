-- Fix critical security vulnerability in clientes table RLS policies
-- Remove overly permissive policy that allows public access to all customer data

-- Drop the insecure policy that allows anyone to see all clients
DROP POLICY IF EXISTS "Todos usuários podem ver clientes" ON public.clientes;

-- Create secure policy that only allows users to see their own clients
CREATE POLICY "Usuários podem ver seus próprios clientes" 
ON public.clientes 
FOR SELECT 
USING (auth.uid() = usuario_id OR EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.perfil = 'admin'::user_profile
));

-- Also fix the INSERT policy to ensure proper ownership
DROP POLICY IF EXISTS "Todos usuários podem criar clientes" ON public.clientes;

-- Create secure INSERT policy that ensures user_id matches authenticated user
CREATE POLICY "Usuários podem criar seus próprios clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);