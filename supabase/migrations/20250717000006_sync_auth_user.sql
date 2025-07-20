-- Atualizar o ID do usuário na tabela users para corresponder ao ID do sistema de autenticação
-- IMPORTANTE: Substitua 'AUTH_USER_ID' pelo ID real gerado pelo sistema de autenticação do Supabase
-- IMPORTANTE: Substitua 'contato.braddockjunior@gmail.com' pelo email do administrador se for diferente

UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  raw_app_meta_data,
  '{perfil}',
  '"admin"'
)
WHERE email = 'contato.braddockjunior@gmail.com';

-- Opção 1: Atualizar o ID na tabela users para corresponder ao ID de autenticação
-- UPDATE public.users
-- SET id = (SELECT id FROM auth.users WHERE email = 'contato.braddockjunior@gmail.com')
-- WHERE email = 'contato.braddockjunior@gmail.com';

-- Opção 2: Atualizar o ID na tabela auth.users para corresponder ao ID existente
-- Esta opção é mais complexa e requer acesso direto ao banco de dados
-- Não é possível fazer isso diretamente via API do Supabase

-- Criar uma função para sincronizar usuários
CREATE OR REPLACE FUNCTION sync_auth_with_users()
RETURNS void AS $$
DECLARE
  auth_user_id UUID;
  public_user_id UUID;
BEGIN
  -- Obter IDs
  SELECT id INTO auth_user_id FROM auth.users WHERE email = 'contato.braddockjunior@gmail.com';
  SELECT id INTO public_user_id FROM public.users WHERE email = 'contato.braddockjunior@gmail.com';
  
  -- Registrar IDs para debug
  RAISE NOTICE 'Auth user ID: %', auth_user_id;
  RAISE NOTICE 'Public user ID: %', public_user_id;
  
  -- Atualizar políticas RLS para permitir ambos os IDs
  -- Esta é uma solução alternativa se não for possível sincronizar os IDs diretamente
  
  -- Atualizar política para inserção
  DROP POLICY IF EXISTS "Apenas administradores podem criar produtos" ON produtos;
  CREATE POLICY "Apenas administradores podem criar produtos" 
  ON produtos FOR INSERT 
  WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE perfil = 'admin') OR
    auth.uid() = auth_user_id
  );
  
  -- Atualizar política para atualização
  DROP POLICY IF EXISTS "Apenas administradores podem atualizar produtos" ON produtos;
  CREATE POLICY "Apenas administradores podem atualizar produtos" 
  ON produtos FOR UPDATE 
  USING (
    auth.uid() IN (SELECT id FROM users WHERE perfil = 'admin') OR
    auth.uid() = auth_user_id
  );
  
  -- Atualizar política para exclusão
  DROP POLICY IF EXISTS "Apenas administradores podem excluir produtos" ON produtos;
  CREATE POLICY "Apenas administradores podem excluir produtos" 
  ON produtos FOR DELETE 
  USING (
    auth.uid() IN (SELECT id FROM users WHERE perfil = 'admin') OR
    auth.uid() = auth_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Executar a função
SELECT sync_auth_with_users();