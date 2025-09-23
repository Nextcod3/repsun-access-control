import { supabase } from './client';

// Reutiliza o cliente tipado do Supabase para evitar múltiplas instâncias de auth
// Mantemos o nome "customSupabase" por compatibilidade com os serviços existentes
export const customSupabase = supabase as any;
// Tipos para as tabelas customizadas
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  cep: string | null;
  documento: string | null;
  uf: string | null;
  usuario_id: string;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  imagem_url: string | null;
  usuario_id: string;
  created_at: string;
  updated_at: string;
  preco_sp: number | null;
  preco_sul_sudeste: number | null;
  preco_outros: number | null;
}

export interface Orcamento {
  id: string;
  numero: number;
  cliente_id: string;
  usuario_id: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
  valor_total: number | null;
  observacoes: string | null;
  data_criacao: string;
  data_envio: string | null;
  data_aprovacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemOrcamento {
  id: string;
  orcamento_id: string;
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface CondicaoPagamento {
  id: string;
  orcamento_id: string;
  descricao: string;
  valor_entrada: number | null;
  num_parcelas: number | null;
  taxa_juros: number | null;
  valor_parcela: number | null;
  valor_total: number;
  metodo: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | null;
  created_at: string;
  updated_at: string;
}

export interface OrcamentoPDF {
  id: string;
  orcamento_id: string;
  url: string;
  versao: number;
  created_at: string;
}