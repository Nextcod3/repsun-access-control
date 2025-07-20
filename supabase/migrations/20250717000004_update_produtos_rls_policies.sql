-- Função para verificar se o usuário é administrador usando o cabeçalho personalizado
CREATE OR REPLACE FUNCTION public.is_admin_by_header()
RETURNS BOOLEAN AS $$
DECLARE
  user_id TEXT;
  is_admin BOOLEAN;
BEGIN
  -- Obter ID do usuário do cabeçalho
  user_id := current_setting('request.headers.x-user-id', true);
  
  -- Se não houver ID no cabeçalho, verificar autenticação normal
  IF user_id IS NULL THEN
    RETURN auth.uid() IN (SELECT id FROM users WHERE perfil = 'admin');
  END IF;
  
  -- Verificar se o usuário é administrador
  SELECT (perfil = 'admin') INTO is_admin FROM users WHERE id = user_id;
  
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar políticas para usar a nova função
DROP POLICY IF EXISTS "Apenas administradores podem criar produtos" ON produtos;
CREATE POLICY "Apenas administradores podem criar produtos" 
ON produtos FOR INSERT 
WITH CHECK (
  public.is_admin_by_header() OR
  auth.uid() IN (SELECT id FROM users WHERE perfil = 'admin')
);

DROP POLICY IF EXISTS "Apenas administradores podem atualizar produtos" ON produtos;
CREATE POLICY "Apenas administradores podem atualizar produtos" 
ON produtos FOR UPDATE 
USING (
  public.is_admin_by_header() OR
  auth.uid() IN (SELECT id FROM users WHERE perfil = 'admin')
);

DROP POLICY IF EXISTS "Apenas administradores podem excluir produtos" ON produtos;
CREATE POLICY "Apenas administradores podem excluir produtos" 
ON produtos FOR DELETE 
USING (
  public.is_admin_by_header() OR
  auth.uid() IN (SELECT id FROM users WHERE perfil = 'admin')
);