-- Migração para corrigir políticas RLS
-- Esta migração implementa políticas RLS adequadas para produtos

-- Desativar RLS temporariamente para aplicar as alterações
ALTER TABLE produtos DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Produtos são visíveis para todos" ON produtos;
DROP POLICY IF EXISTS "Produtos só podem ser inseridos por admins" ON produtos;
DROP POLICY IF EXISTS "Produtos só podem ser atualizados por admins" ON produtos;
DROP POLICY IF EXISTS "Produtos só podem ser excluídos por admins" ON produtos;

-- Reativar RLS
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Criar novas políticas
-- Política de leitura: qualquer usuário autenticado pode ler produtos
CREATE POLICY "Produtos são visíveis para usuários autenticados" 
ON produtos FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política de inserção: apenas administradores podem inserir produtos
CREATE POLICY "Produtos só podem ser inseridos por admins" 
ON produtos FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.perfil = 'admin'
  )
);

-- Política de atualização: apenas administradores podem atualizar produtos
CREATE POLICY "Produtos só podem ser atualizados por admins" 
ON produtos FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.perfil = 'admin'
  )
);

-- Política de exclusão: apenas administradores podem excluir produtos
CREATE POLICY "Produtos só podem ser excluídos por admins" 
ON produtos FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.perfil = 'admin'
  )
);