-- Tabela de Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco TEXT,
  usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir usuários acessarem apenas seus próprios clientes
CREATE POLICY "Usuários acessam seus próprios clientes" ON public.clientes
  FOR ALL USING (usuario_id = auth.uid() OR 
                (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'admin');

-- Tabela de Produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  imagem_url TEXT,
  usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela produtos
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir usuários acessarem apenas seus próprios produtos
CREATE POLICY "Usuários acessam seus próprios produtos" ON public.produtos
  FOR ALL USING (usuario_id = auth.uid() OR 
                (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'admin');

-- Enum para status do orçamento
CREATE TYPE orcamento_status AS ENUM ('rascunho', 'enviado', 'aprovado', 'rejeitado', 'finalizado');

-- Tabela de Orçamentos
CREATE TABLE public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status orcamento_status NOT NULL DEFAULT 'rascunho',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela orcamentos
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir usuários acessarem apenas seus próprios orçamentos
CREATE POLICY "Usuários acessam seus próprios orçamentos" ON public.orcamentos
  FOR ALL USING (usuario_id = auth.uid() OR 
                (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'admin');

-- Tabela de Itens de Orçamento
CREATE TABLE public.itens_orcamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela itens_orcamento
ALTER TABLE public.itens_orcamento ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir usuários acessarem apenas itens de seus próprios orçamentos
CREATE POLICY "Usuários acessam itens de seus próprios orçamentos" ON public.itens_orcamento
  FOR ALL USING ((SELECT usuario_id FROM public.orcamentos WHERE id = orcamento_id) = auth.uid() OR 
                (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'admin');

-- Enum para método de pagamento
CREATE TYPE metodo_pagamento AS ENUM ('cartao_credito', 'boleto', 'pix');

-- Enum para forma de pagamento
CREATE TYPE forma_pagamento AS ENUM (
  'ENTRADA + 07 PARCELAS IGUAIS',
  'ENTRADA + 3 PARCELAS IGUAIS',
  'ENTRADA + 4 PARCELAS',
  'ENTRADA + 6 PARCELAS',
  'ENTRADA E SALDO EM 9X',
  '20% DE ENTRADA + 11 PARCELAS IGUAIS',
  '28 DDL',
  '30 DDL',
  '30% ENTRADA + 11 PARCELAS IGUAIS',
  '30% ENTRADA + 9 PARCELAS IGUAIS',
  '30,60,90,120,150,180,210,240,270 DDL',
  '30/60 DDL',
  '30/60/90 DDL',
  '30/60/90/120 DDL',
  '30/60/90/120/150 DDL',
  '30/60/90/120/150/180 DDL',
  '40% ENTRADA + 11 PARCELAS IGUAIS',
  '45 DDL',
  '50% ENTRADA + 11 PARCELAS IGUAIS',
  'A VISTA',
  '1 + 11 - ENTRADA + 11 PARCELAS',
  '1 P/ 30 + 9 PARCELAS IGUAIS',
  '1 P/15 DIAS + 9 PARCELAS',
  '1+11 - ENTRADA P/ 15 DIAS + 11 PARCELAS',
  '10% DE ENTRADA + 11 PARCELAS IGUAIS',
  '11 PARCELAS IGUAIS - PRIMEIRA 30 DDL',
  '12 PARCELAS IGUAIS - PRIMEIRA 30 DDL',
  '13 PARCELAS IGUAIS - PRIMEIRA 30 DDL',
  '14 PARCELAS IGUAIS - PRIMEIRA 30 DDL',
  '15 DIAS',
  '15 PARCELAS IGUAIS - PRIMEIRA 30 DDL',
  '16 PARCELAS IGUAIS - PRIMEIRA 30 DDL',
  '17 PARCELAS IGUAIS - PRIMEIRA 30 DDL',
  '18 PARCELAS IGUAIS - PRIMEIRA 30 DDL',
  '20 DDL'
);

-- Tabela de Condições de Pagamento
CREATE TABLE public.condicoes_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  forma_pagamento forma_pagamento NOT NULL,
  metodo_pagamento metodo_pagamento NOT NULL DEFAULT 'boleto',
  valor_entrada DECIMAL(10, 2),
  num_parcelas INTEGER,
  taxa_juros DECIMAL(5, 2) DEFAULT 0,
  valor_parcela DECIMAL(10, 2),
  valor_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_orcamento_id UNIQUE (orcamento_id)
);

-- Habilitar RLS na tabela condicoes_pagamento
ALTER TABLE public.condicoes_pagamento ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir usuários acessarem apenas condições de seus próprios orçamentos
CREATE POLICY "Usuários acessam condições de seus próprios orçamentos" ON public.condicoes_pagamento
  FOR ALL USING ((SELECT usuario_id FROM public.orcamentos WHERE id = orcamento_id) = auth.uid() OR 
                (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'admin');

-- Criar storage bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public) VALUES ('produtos', 'produtos', true);

-- Criar política para permitir acesso público às imagens de produtos
CREATE POLICY "Acesso público às imagens de produtos" ON storage.objects FOR SELECT
  USING (bucket_id = 'produtos');

-- Criar política para permitir upload de imagens apenas para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de imagens" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'produtos' AND auth.role() = 'authenticated');

-- Criar política para permitir usuários excluírem apenas suas próprias imagens
CREATE POLICY "Usuários podem excluir suas próprias imagens" ON storage.objects FOR DELETE
  USING (bucket_id = 'produtos' AND (auth.uid() = owner OR 
        (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'admin'));