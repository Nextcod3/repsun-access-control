-- Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para leitura (apenas administradores podem ler todos os usuários)
CREATE POLICY "Administradores podem ler todos os usuários" 
ON users FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE perfil = 'admin'
  )
);

-- Política para leitura (usuários podem ler seus próprios dados)
CREATE POLICY "Usuários podem ler seus próprios dados" 
ON users FOR SELECT 
USING (
  auth.uid() = id
);

-- Política para atualização (apenas administradores podem atualizar qualquer usuário)
CREATE POLICY "Administradores podem atualizar qualquer usuário" 
ON users FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE perfil = 'admin'
  )
);

-- Política para atualização (usuários podem atualizar seus próprios dados)
CREATE POLICY "Usuários podem atualizar seus próprios dados" 
ON users FOR UPDATE 
USING (
  auth.uid() = id
);

-- Política para exclusão (apenas administradores podem excluir usuários)
CREATE POLICY "Apenas administradores podem excluir usuários" 
ON users FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE perfil = 'admin'
  )
);