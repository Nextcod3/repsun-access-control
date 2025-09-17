-- Atualizar política para permitir que administradores vejam todos os usuários
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Nova política que permite usuários verem seus próprios perfis OU administradores verem todos
CREATE POLICY "Users can view their own profile or admins can view all" 
ON public.users 
FOR SELECT 
USING (
  auth.uid() = id 
  OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND perfil = 'admin'
    AND status = true
  )
);