import { supabase } from '@/integrations/supabase/client';
import { TABLES, ORCAMENTO_STATUS } from '@/utils/constants';
import { handleSupabaseError } from '@/utils/errorHandler';
import type { Tables } from '@/types/database.types';

export type Orcamento = Tables<'orcamentos'>;
export type ItemOrcamento = Tables<'itens_orcamento'>;
export type CondicaoPagamento = Tables<'condicoes_pagamento'>;
export type OrcamentoPDF = Tables<'orcamentos_pdf'>;

/**
 * Cria um novo orçamento
 */
export const createOrcamento = async (
  clienteId: string,
  usuarioId: string,
  observacoes?: string
): Promise<Orcamento> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ORCAMENTOS)
      .insert({
        cliente_id: clienteId,
        usuario_id: usuarioId,
        observacoes,
        status: ORCAMENTO_STATUS.RASCUNHO
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
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
  try {
    const subtotal = quantidade * valorUnitario;

    const { data, error } = await supabase
      .from(TABLES.ITENS_ORCAMENTO)
      .insert({
        orcamento_id: orcamentoId,
        produto_id: produtoId,
        quantidade,
        valor_unitario: valorUnitario,
        subtotal
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
};

/**
 * Atualiza um item do orçamento
 */
export const updateItemOrcamento = async (
  id: string,
  quantidade: number,
  valorUnitario: number
): Promise<ItemOrcamento> => {
  try {
    const subtotal = quantidade * valorUnitario;

    const { data, error } = await supabase
      .from(TABLES.ITENS_ORCAMENTO)
      .update({
        quantidade,
        valor_unitario: valorUnitario,
        subtotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
};

/**
 * Remove um item do orçamento
 */
export const removeItemOrcamento = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from(TABLES.ITENS_ORCAMENTO)
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    throw handleSupabaseError(error);
  }
};

/**
 * Adiciona uma condição de pagamento ao orçamento
 */
export const addCondicaoPagamento = async (
  condicao: Omit<CondicaoPagamento, 'id' | 'created_at' | 'updated_at'>
): Promise<CondicaoPagamento> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.CONDICOES_PAGAMENTO)
      .insert(condicao)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
};

/**
 * Remove uma condição de pagamento
 */
export const removeCondicaoPagamento = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from(TABLES.CONDICOES_PAGAMENTO)
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    throw handleSupabaseError(error);
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
  try {
    const updates: Partial<Orcamento> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (observacoes) {
      updates.observacoes = observacoes;
    }

    // Atualizar datas com base no status
    if (status === ORCAMENTO_STATUS.ENVIADO) {
      updates.data_envio = new Date().toISOString();
    } else if (status === ORCAMENTO_STATUS.APROVADO) {
      updates.data_aprovacao = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from(TABLES.ORCAMENTOS)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
};

/**
 * Salva o PDF do orçamento
 */
export const saveOrcamentoPDF = async (
  orcamentoId: string,
  url: string
): Promise<OrcamentoPDF> => {
  try {
    // Verificar se já existe um PDF para este orçamento
    const { data: existingPdfs } = await supabase
      .from(TABLES.ORCAMENTOS_PDF)
      .select('*')
      .eq('orcamento_id', orcamentoId)
      .order('versao', { ascending: false });

    const versao = existingPdfs && existingPdfs.length > 0 ? existingPdfs[0].versao + 1 : 1;

    const { data, error } = await supabase
      .from(TABLES.ORCAMENTOS_PDF)
      .insert({
        orcamento_id: orcamentoId,
        url,
        versao
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw handleSupabaseError(error);
  }
};