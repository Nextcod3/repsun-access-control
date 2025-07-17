import { supabase } from '@/integrations/supabase/client';
import { TABLES } from '@/utils/constants';
import { handleSupabaseError } from '@/utils/errorHandler';
import type { Tables } from '@/types/database.types';

export type Orcamento = Tables<'orcamentos'>;

/**
 * Busca todos os orçamentos do usuário atual
 */
export const getOrcamentos = async (): Promise<Orcamento[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ORCAMENTOS)
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
  itens: (Tables<'itens_orcamento'> & { produto: Tables<'produtos'> })[];
  condicoes: Tables<'condicoes_pagamento'>[];
  cliente: Tables<'clientes'>;
}> => {
  try {
    // Buscar orçamento
    const { data: orcamento, error: orcamentoError } = await supabase
      .from(TABLES.ORCAMENTOS)
      .select('*')
      .eq('id', id)
      .single();

    if (orcamentoError) throw orcamentoError;

    // Buscar cliente
    const { data: cliente, error: clienteError } = await supabase
      .from(TABLES.CLIENTES)
      .select('*')
      .eq('id', orcamento.cliente_id)
      .single();

    if (clienteError) throw clienteError;

    // Buscar itens com produtos
    const { data: itens, error: itensError } = await supabase
      .from(TABLES.ITENS_ORCAMENTO)
      .select(`
        *,
        produto:produto_id (*)
      `)
      .eq('orcamento_id', id);

    if (itensError) throw itensError;

    // Buscar condições de pagamento
    const { data: condicoes, error: condicoesError } = await supabase
      .from(TABLES.CONDICOES_PAGAMENTO)
      .select('*')
      .eq('orcamento_id', id);

    if (condicoesError) throw condicoesError;

    return {
      orcamento,
      itens: itens as any,
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
export const getOrcamentoPDFs = async (orcamentoId: string): Promise<Tables<'orcamentos_pdf'>[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ORCAMENTOS_PDF)
      .select('*')
      .eq('orcamento_id', orcamentoId)
      .order('versao', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleSupabaseError(error);
  }
};