-- Remover constraint existente se houver e recriar corretamente
ALTER TABLE public.clientes 
DROP CONSTRAINT IF EXISTS check_cep_format;

-- Adicionar campos cidade e cep à tabela clientes (se não existirem)
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS cep TEXT;

-- Atualizar colunas para serem obrigatórias (para novos registros)
ALTER TABLE public.clientes 
ALTER COLUMN nome SET NOT NULL,
ALTER COLUMN telefone SET NOT NULL,
ALTER COLUMN uf SET NOT NULL;

-- Adicionar constraint para validar formato do CEP (formato brasileiro)
ALTER TABLE public.clientes 
ADD CONSTRAINT check_cep_format 
CHECK (cep IS NULL OR cep ~ '^\d{5}-\d{3}$');