-- Habilitar RLS na tabela produtos
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Política para leitura (todos os usuários autenticados podem ler)
CREATE POLICY "Usuários autenticados podem ler produtos" 
ON produtos FOR SELECT 
USING (auth.uid() IN (SELECT id FROM users));

-- Política para inserção (apenas administradores podem criar)
CREATE POLICY "Apenas administradores podem criar produtos" 
ON produtos FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users WHERE perfil = 'admin'
  )
);

-- Política para atualização (apenas administradores podem atualizar)
CREATE POLICY "Apenas administradores podem atualizar produtos" 
ON produtos FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE perfil = 'admin'
  )
);

-- Política para exclusão (apenas administradores podem excluir)
CREATE POLICY "Apenas administradores podem excluir produtos" 
ON produtos FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE perfil = 'admin'
  )
);