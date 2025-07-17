
-- Criar enum para o perfil do usuário
CREATE TYPE user_profile AS ENUM ('admin', 'usuario');

-- Criar a tabela users
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  perfil user_profile NOT NULL DEFAULT 'usuario',
  status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir inserção (cadastro)
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (true);

-- Criar política para leitura (login)
CREATE POLICY "Allow user login" ON public.users
  FOR SELECT USING (true);

-- Criar política para atualização
CREATE POLICY "Allow user updates" ON public.users
  FOR UPDATE USING (true);

-- Inserir o usuário administrador (senha já hasheada para 123S3nha456@)
INSERT INTO public.users (nome, email, senha_hash, perfil, status)
VALUES (
  'Pabington Gaspar',
  'pabingtongaspar@gmail.com',
  '$2b$10$X8yLQzGzOtQpJy5j4.KQZ.1N9qKVL8YzBpN6rOZjM2F8iQwEp9.Ey',
  'admin',
  true
);
