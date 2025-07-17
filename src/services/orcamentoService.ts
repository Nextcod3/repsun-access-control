import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/types/database.types';

export type Orcamento = Tables<'orcamentos'>;
export type ItemOrcamento = Tables<'itens_orcamento'>;
export type CondicaoPagamento = Tables<'condicoes_pagamento'>;
export type OpcaoPagamento = Tables<'opcoes_pagamento'>;
export type OrcamentoPDF = Tables<'orcamentos_pdf'>;

/**
 * Busca todos os orçamentos do usuário atual
 */
export const getOrcamentos = async (): Promise<Orcamento[]> => {
  const { data, error } = await supabase
    .from('orcamentos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar orçamentos:', error);
    throw new Error('Erro ao buscar orçamentos');
  }

  return data || [];
};

/**
 * Busca um orçamento pelo ID com todos os detalhes
 */
export const getOrcamentoCompleto = async (id: string): Promise<{
  orcamento: Orcamento;
  itens: (ItemOrcamento & { produto: Tables<'produtos'> })[];
  condicoes: CondicaoPagamento[];
  cliente: Tables<'clientes'>;
}> => {
  // Buscar orçamento
  const { data: orcamento, error: orcamentoError } = await supabase
    .from('orcamentos')
    .select('*')
    .eq('id', id)
    .single();

  if (orcamentoError) {
    console.error('Erro ao buscar orçamento:', orcamentoError);
    throw new Error('Erro ao buscar orçamento');
  }

  // Buscar cliente
  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', orcamento.cliente_id)
    .single();

  if (clienteError) {
    console.error('Erro ao buscar cliente do orçamento:', clienteError);
    throw new Error('Erro ao buscar cliente do orçamento');
  }

  // Buscar itens com produtos
  const { data: itens, error: itensError } = await supabase
    .from('itens_orcamento')
    .select(`
      *,
      produto:produto_id (*)
    `)
    .eq('orcamento_id', id);

  if (itensError) {
    console.error('Erro ao buscar itens do orçamento:', itensError);
    throw new Error('Erro ao buscar itens do orçamento');
  }

  // Buscar condições de pagamento
  const { data: condicoes, error: condicoesError } = await supabase
    .from('condicoes_pagamento')
    .select('*')
    .eq('orcamento_id', id);

  if (condicoesError) {
    console.error('Erro ao buscar condições de pagamento:', condicoesError);
    throw new Error('Erro ao buscar condições de pagamento');
  }

  return {
    orcamento,
    itens: itens as any,
    condicoes: condicoes || [],
    cliente
  };
};

/**
 * Cria um novo orçamento
 */
export const createOrcamento = async (
  clienteId: string,
  usuarioId: string,
  observacoes?: string
): Promise<Orcamento> => {
  const { data, error } = await supabase
    .from('orcamentos')
    .insert({
      cliente_id: clienteId,
      usuario_id: usuarioId,
      observacoes,
      status: 'rascunho'
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar orçamento:', error);
    throw new Error('Erro ao criar orçamento');
  }

  return data;
};

/**
 * Adiciona um item ao orçamento
 */
export const addItemOrcamento = async (
  orcamentoId: string,
  produtoId: string,
  quantidade: number,
  valorUnitario: number
): Promise<ItemOrcamento> => {
  const subtotal = quantidade * valorUnitario;

  const { data, error } = await supabase
    .from('itens_orcamento')
    .insert({
      orcamento_id: orcamentoId,
      produto_id: produtoId,
      quantidade,
      valor_unitario: valorUnitario,
      subtotal
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar item ao orçamento:', error);
    throw new Error('Erro ao adicionar item ao orçamento');
  }

  return data;
};

/**
 * Atualiza um item do orçamento
 */
export const updateItemOrcamento = async (
  id: string,
  quantidade: number,
  valorUnitario: number
): Promise<ItemOrcamento> => {
  const subtotal = quantidade * valorUnitario;

  const { data, error } = await supabase
    .from('itens_orcamento')
    .update({
      quantidade,
      valor_unitario: valorUnitario,
      subtotal,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar item do orçamento:', error);
    throw new Error('Erro ao atualizar item do orçamento');
  }

  return data;
};

/**
 * Remove um item do orçamento
 */
export const removeItemOrcamento = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('itens_orcamento')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao remover item do orçamento:', error);
    throw new Error('Erro ao remover item do orçamento');
  }
};

/**
 * Busca todas as opções de pagamento disponíveis
 */
export const getOpcoesPagamento = async (): Promise<OpcaoPagamento[]> => {
  const { data, error } = await supabase
    .from('opcoes_pagamento')
    .select('*')
    .eq('ativo', true)
    .order('descricao');

  if (error) {
    console.error('Erro ao buscar opções de pagamento:', error);
    throw new Error('Erro ao buscar opções de pagamento');
  }

  return data || [];
};

/**
 * Adiciona uma condição de pagamento ao orçamento
 */
export const addCondicaoPagamento = async (
  condicao: Omit<CondicaoPagamento, 'id' | 'created_at' | 'updated_at'>
): Promise<CondicaoPagamento> => {
  const { data, error } = await supabase
    .from('condicoes_pagamento')
    .insert(condicao)
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar condição de pagamento:', error);
    throw new Error('Erro ao adicionar condição de pagamento');
  }

  return data;
};

/**
 * Remove uma condição de pagamento
 */
export const removeCondicaoPagamento = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('condicoes_pagamento')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao remover condição de pagamento:', error);
    throw new Error('Erro ao remover condição de pagamento');
  }
};

/**
 * Atualiza o status do orçamento
 */
export const updateOrcamentoStatus = async (
  id: string,
  status: Orcamento['status'],
  observacoes?: string
): Promise<Orcamento> => {
  const updates: Partial<Orcamento> = {
    status,
    updated_at: new Date().toISOString()
  };

  if (observacoes) {
    updates.observacoes = observacoes;
  }

  // Atualizar datas com base no status
  if (status === 'enviado') {
    updates.data_envio = new Date().toISOString();
  } else if (status === 'aprovado') {
    updates.data_aprovacao = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('orcamentos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar status do orçamento:', error);
    throw new Error('Erro ao atualizar status do orçamento');
  }

  return data;
};

/**
 * Salva o PDF do orçamento
 */
export const saveOrcamentoPDF = async (
  orcamentoId: string,
  url: string
): Promise<OrcamentoPDF> => {
  // Verificar se já existe um PDF para este orçamento
  const { data: existingPdfs } = await supabase
    .from('orcamentos_pdf')
    .select('*')
    .eq('orcamento_id', orcamentoId)
    .order('versao', { ascending: false });

  const versao = existingPdfs && existingPdfs.length > 0 ? existingPdfs[0].versao + 1 : 1;

  const { data, error } = await supabase
    .from('orcamentos_pdf')
    .insert({
      orcamento_id: orcamentoId,
      url,
      versao
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar PDF do orçamento:', error);
    throw new Error('Erro ao salvar PDF do orçamento');
  }

  return data;
};

/**
 * Busca os PDFs de um orçamento
 */
export const getOrcamentoPDFs = async (orcamentoId: string): Promise<OrcamentoPDF[]> => {
  const { data, error } = await supabase
    .from('orcamentos_pdf')
    .select('*')
    .eq('orcamento_id', orcamentoId)
    .order('versao', { ascending: false });

  if (error) {
    console.error('Erro ao buscar PDFs do orçamento:', error);
    throw new Error('Erro ao buscar PDFs do orçamento');
  }

  return data || [];
};