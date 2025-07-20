-- Desabilitar temporariamente RLS na tabela produtos para testes
ALTER TABLE produtos DISABLE ROW LEVEL SECURITY;

-- Adicionar comentário para lembrar de reabilitar depois
COMMENT ON TABLE produtos IS 'RLS temporariamente desabilitado para testes. Reabilitar em produção.';