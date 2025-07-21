import { customSupabase, type Orcamento, type ItemOrcamento, type CondicaoPagamento, type OrcamentoPDF } from '@/integrations/supabase/custom-client';
import { type Cliente } from '@/services/clienteService';
import { type Produto } from '@/services/produtoService';
import { handleSupabaseError } from '@/utils/errorHandler';

// Re-exportar tipos para evitar conflitos
export type { Orcamento as OrcamentoQuery, ItemOrcamento, CondicaoPagamento, OrcamentoPDF };

/**
 * Busca todos os orçamentos do usuário atual
 */
export const getOrcamentos = async (): Promise<Orcamento[]> => {
  try {
    const { data, error } = await customSupabase
      .from('orcamentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
};

/**
 * Busca um orçamento pelo ID com todos os detalhes
 */
export const getOrcamentoCompleto = async (id: string): Promise<{
  orcamento: Orcamento;
  itens: (ItemOrcamento & { produto: Produto })[];
  condicoes: CondicaoPagamento[];
  cliente: Cliente;
}> => {
  try {
    // Buscar orçamento
    const { data: orcamento, error: orcamentoError } = await customSupabase
      .from('orcamentos')
      .select('*')
      .eq('id', id)
      .single();

    if (orcamentoError) throw orcamentoError;

    // Buscar cliente
    const { data: cliente, error: clienteError } = await customSupabase
      .from('clientes')
      .select('*')
      .eq('id', orcamento.cliente_id)
      .single();

    if (clienteError) throw clienteError;

    // Buscar itens do orçamento
    const { data: itensData, error: itensError } = await customSupabase
      .from('itens_orcamento')
      .select('*')
      .eq('orcamento_id', id)
      .order('created_at');

    if (itensError) throw itensError;

    // Buscar produtos para cada item
    const itens: (ItemOrcamento & { produto: Produto })[] = [];
    for (const item of itensData || []) {
      const { data: produto, error: produtoError } = await customSupabase
        .from('produtos')
        .select('*')
        .eq('id', item.produto_id)
        .single();

      if (produtoError || !produto) {
        console.error('Erro ao buscar produto do item:', produtoError);
        continue;
      }

      itens.push({ ...item, produto });
    }

    // Buscar condições de pagamento
    const { data: condicoes, error: condicoesError } = await customSupabase
      .from('condicoes_pagamento')
      .select('*')
      .eq('orcamento_id', id);

    if (condicoesError) throw condicoesError;

    return {
      orcamento,
      itens,
      condicoes: condicoes || [],
      cliente
    };
  } catch (error) {
    throw handleSupabaseError(error);
  }
};

/**
 * Busca os PDFs de um orçamento
 */
export const getOrcamentoPDFs = async (orcamentoId: string): Promise<OrcamentoPDF[]> => {
  try {
    const { data, error } = await customSupabase
      .from('orcamentos_pdf')
      .select('*')
      .eq('orcamento_id', orcamentoId)
      .order('versao', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
};