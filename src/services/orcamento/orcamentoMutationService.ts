import { customSupabase, type Orcamento, type ItemOrcamento, type CondicaoPagamento } from '@/integrations/supabase/custom-client';
import { TABLES, ORCAMENTO_STATUS } from '@/utils/constants';
import { handleSupabaseError } from '@/utils/errorHandler';
import { notifyOrcamentoCriado, notifyOrcamentoStatusChange } from '@/services/notificationService';

export type { Orcamento, ItemOrcamento, CondicaoPagamento };

/**
 * Cria um novo orçamento
 */
export const createOrcamento = async (
  clienteId: string,
  usuarioId: string,
  observacoes?: string
): Promise<Orcamento> => {
  try {
    const { data, error } = await customSupabase
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
      throw handleSupabaseError(error);
    }

    // Criar notificação de orçamento criado
    try {
      await notifyOrcamentoCriado(usuarioId, data.id, data.numero.toString());
    } catch (notificationError) {
      console.error('Erro ao criar notificação:', notificationError);
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    throw error;
  }
};

/**
 * Adiciona item ao orçamento
 */
export const addItemOrcamento = async (item: {
  orcamento_id: string;
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
}): Promise<ItemOrcamento> => {
  try {
    const { data, error } = await customSupabase
      .from('itens_orcamento')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar item ao orçamento:', error);
      throw handleSupabaseError(error);
    }

    return data;
  } catch (error) {
    console.error('Erro ao adicionar item ao orçamento:', error);
    throw error;
  }
};

/**
 * Atualiza item do orçamento
 */
export const updateItemOrcamento = async (
  itemId: string,
  updates: {
    quantidade?: number;
    valor_unitario?: number;
    subtotal?: number;
  }
): Promise<ItemOrcamento> => {
  try {
    const { data, error } = await customSupabase
      .from('itens_orcamento')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar item do orçamento:', error);
      throw handleSupabaseError(error);
    }

    return data;
  } catch (error) {
    console.error('Erro ao atualizar item do orçamento:', error);
    throw error;
  }
};

/**
 * Remove item do orçamento
 */
export const removeItemOrcamento = async (itemId: string): Promise<void> => {
  try {
    const { error } = await customSupabase
      .from('itens_orcamento')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Erro ao remover item do orçamento:', error);
      throw handleSupabaseError(error);
    }
  } catch (error) {
    console.error('Erro ao remover item do orçamento:', error);
    throw error;
  }
};

/**
 * Adiciona condição de pagamento ao orçamento
 */
export const addCondicaoPagamento = async (condicao: {
  orcamento_id: string;
  descricao: string;
  valor_entrada?: number | null;
  num_parcelas?: number | null;
  taxa_juros?: number | null;
  valor_parcela?: number | null;
  valor_total: number;
  metodo?: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto' | null;
}): Promise<CondicaoPagamento> => {
  try {
    const { data, error } = await customSupabase
      .from('condicoes_pagamento')
      .insert(condicao)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar condição de pagamento:', error);
      throw handleSupabaseError(error);
    }

    return data;
  } catch (error) {
    console.error('Erro ao adicionar condição de pagamento:', error);
    throw error;
  }
};

/**
 * Atualiza o status do orçamento
 */
export const updateOrcamentoStatus = async (
  orcamentoId: string,
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado'
): Promise<Orcamento> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Adicionar timestamp específico baseado no status
    if (status === 'enviado') {
      updateData.data_envio = new Date().toISOString();
    } else if (status === 'aprovado') {
      updateData.data_aprovacao = new Date().toISOString();
    }

    const { data, error } = await customSupabase
      .from('orcamentos')
      .update(updateData)
      .eq('id', orcamentoId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status do orçamento:', error);
      throw handleSupabaseError(error);
    }

    // Criar notificação de mudança de status
    try {
      await notifyOrcamentoStatusChange(
        data.usuario_id,
        orcamentoId,
        data.numero.toString(),
        status
      );
    } catch (notificationError) {
      console.error('Erro ao criar notificação:', notificationError);
    }

    return data;
  } catch (error) {
    console.error('Erro ao atualizar status do orçamento:', error);
    throw error;
  }
};

/**
 * Atualiza um orçamento
 */
export const updateOrcamento = async (
  orcamentoId: string,
  updates: Partial<Omit<Orcamento, 'id' | 'numero' | 'created_at' | 'updated_at'>>
): Promise<Orcamento> => {
  try {
    const { data, error } = await customSupabase
      .from('orcamentos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', orcamentoId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw handleSupabaseError(error);
    }

    return data;
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    throw error;
  }
};

/**
 * Exclui um orçamento e todos os seus itens relacionados
 */
export const deleteOrcamento = async (orcamentoId: string): Promise<void> => {
  try {
    // Primeiro, excluir itens do orçamento
    await customSupabase
      .from('itens_orcamento')
      .delete()
      .eq('orcamento_id', orcamentoId);

    // Excluir condições de pagamento
    await customSupabase
      .from('condicoes_pagamento')
      .delete()
      .eq('orcamento_id', orcamentoId);

    // Por fim, excluir o orçamento
    const { error } = await customSupabase
      .from('orcamentos')
      .delete()
      .eq('id', orcamentoId);

    if (error) {
      console.error('Erro ao excluir orçamento:', error);
      throw handleSupabaseError(error);
    }
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    throw error;
  }
};