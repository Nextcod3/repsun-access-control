-- Função para obter o preço do produto com base na UF do cliente
CREATE OR REPLACE FUNCTION public.get_produto_preco(produto_id UUID, uf TEXT)
RETURNS NUMERIC AS $$
DECLARE
  preco NUMERIC;
BEGIN
  -- Buscar o produto
  SELECT 
    CASE
      WHEN uf = 'SP' THEN p.preco_sp
      WHEN uf IN ('MG', 'RJ', 'PR', 'RS', 'SC') THEN p.preco_sul_sudeste
      ELSE p.preco_outros
    END INTO preco
  FROM produtos p
  WHERE p.id = produto_id;
  
  RETURN COALESCE(preco, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;