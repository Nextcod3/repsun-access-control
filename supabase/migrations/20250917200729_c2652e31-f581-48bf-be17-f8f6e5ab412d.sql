-- Criar função security definer para evitar recursão infinita nas políticas RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT perfil::TEXT FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Remover política problemática
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.users;

-- Criar políticas corretas sem recursão
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- Política para administradores poderem atualizar usuários
CREATE POLICY "Admins can update users" 
ON public.users 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');