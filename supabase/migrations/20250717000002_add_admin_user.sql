-- Adicionar usuário administrador
-- A senha é 'admin123' (hash gerado com bcrypt)
INSERT INTO public.users (
  nome, 
  email, 
  senha_hash, 
  perfil, 
  status, 
  created_at, 
  updated_at
)
VALUES (
  'Administrador', 
  'admin@repsun.com', 
  '$2a$10$ywfXlnPjpTdGzWGWs1F0B.YqrNzxvDXUxQHM/YCbgQVya8.21Jv1i', 
  'admin', 
  true, 
  NOW(), 
  NOW()
)
ON CONFLICT (email) DO NOTHING;