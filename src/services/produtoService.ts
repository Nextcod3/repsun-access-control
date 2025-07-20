import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/types/database.types';
import { API_URL, SUPABASE_ANON_KEY } from '@/config/env';

export type Produto = Tables<'produtos'>;

/**
 * Busca todos os produtos
 */
export const getProdutos = async (): Promise<Produto[]> => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    throw new Error('Erro ao buscar produtos');
  }

  return data || [];
};

/**
 * Busca um produto pelo ID
 */
export const getProdutoById = async (id: string): Promise<Produto | null> => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar produto:', error);
    throw new Error('Erro ao buscar produto');
  }

  return data;
};

/**
 * Busca produtos por nome
 */
export const searchProdutos = async (query: string): Promise<Produto[]> => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .ilike('nome', `%${query}%`)
    .order('nome');

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    throw new Error('Erro ao buscar produtos');
  }

  return data || [];
};

/**
 * Cria um novo produto (apenas admin)
 */
export const createProduto = async (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>): Promise<Produto> => {
  try {
    console.log('Tentando criar produto:', produto);
    
    // Usar o cliente Supabase com autenticação adequada
    const { data, error } = await supabase
      .from('produtos')
      .insert(produto)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto (detalhes):', error);
      
      // Se for erro de RLS, verificar se o usuário tem permissão adequada
      if (error.message?.includes('row-level security') || 
          error.message?.includes('permission denied')) {
        
        console.log('Erro de RLS detectado. Verifique se o usuário tem permissão de administrador.');
        throw new Error('Permissão negada: apenas administradores podem criar produtos');
      }
      
      throw new Error(`Erro ao criar produto: ${error.message}`);
    }

    console.log('Produto criado com sucesso:', data);
    return data;
  } catch (error: any) {
    console.error('Exceção ao criar produto:', error);
    throw error;
  }
};

/**
 * Atualiza um produto existente (apenas admin)
 */
export const updateProduto = async (id: string, produto: Partial<Omit<Produto, 'id' | 'created_at' | 'updated_at'>>): Promise<Produto> => {
  try {
    console.log('Tentando atualizar produto:', { id, produto });
    
    // Adicionar timestamp de atualização
    const produtoComTimestamp = { 
      ...produto, 
      updated_at: new Date().toISOString() 
    };
    
    // Atualizar usando o cliente Supabase
    const { data, error } = await supabase
      .from('produtos')
      .update(produtoComTimestamp)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      
      // Se for erro de RLS, verificar se o usuário tem permissão adequada
      if (error.message?.includes('row-level security') || 
          error.message?.includes('permission denied')) {
        
        console.log('Erro de RLS detectado. Verifique se o usuário tem permissão de administrador.');
        throw new Error('Permissão negada: apenas administradores podem atualizar produtos');
      }
      
      throw new Error(`Erro ao atualizar produto: ${error.message}`);
    }

    console.log('Produto atualizado com sucesso:', data);
    return data;
  } catch (error: any) {
    console.error('Exceção ao atualizar produto:', error);
    throw error;
  }
};

/**
 * Exclui um produto (apenas admin)
 */
export const deleteProduto = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir produto:', error);
    
    // Se for erro de RLS, verificar se o usuário tem permissão adequada
    if (error.message?.includes('row-level security') || 
        error.message?.includes('permission denied')) {
      
      throw new Error('Permissão negada: apenas administradores podem excluir produtos');
    }
    
    throw new Error('Erro ao excluir produto');
  }
};

/**
 * Verifica se uma URL de imagem é válida
 */
export const verificarImagemUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return contentType?.startsWith('image/') || false;
  } catch (error) {
    console.error('Erro ao verificar URL da imagem:', error);
    return false;
  }
};

/**
 * Obtém o preço do produto com base na UF do cliente
 */
export const getProdutoPreco = async (produtoId: string, uf: string): Promise<number> => {
  const { data, error } = await supabase
    .rpc('get_produto_preco', {
      produto_id: produtoId,
      uf: uf
    });

  if (error) {
    console.error('Erro ao obter preço do produto:', error);
    throw new Error('Erro ao obter preço do produto');
  }

  return data || 0;
};