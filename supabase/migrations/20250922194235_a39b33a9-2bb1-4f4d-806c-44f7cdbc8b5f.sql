-- Corrigir as funções para ter search_path seguro
CREATE OR REPLACE FUNCTION public.get_produto_preco(produto_id uuid, uf text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  preco DECIMAL(10, 2);
BEGIN
  -- Determinar o preço com base na UF do cliente
  IF uf = 'SP' THEN
    SELECT preco_sp INTO preco FROM public.produtos WHERE id = produto_id;
  ELSIF uf IN ('MG', 'RJ', 'PR', 'RS', 'SC') THEN
    SELECT preco_sul_sudeste INTO preco FROM public.produtos WHERE id = produto_id;
  ELSE
    SELECT preco_outros INTO preco FROM public.produtos WHERE id = produto_id;
  END IF;
  
  RETURN preco;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_orcamento_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Atualizar o valor total do orçamento
  UPDATE public.orcamentos
  SET valor_total = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM public.itens_orcamento
    WHERE orcamento_id = CASE
      WHEN TG_OP = 'DELETE' THEN OLD.orcamento_id
      ELSE NEW.orcamento_id
    END
  ),
  updated_at = now()
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.orcamento_id
    ELSE NEW.orcamento_id
  END;
  
  RETURN NULL;
END;
$function$;