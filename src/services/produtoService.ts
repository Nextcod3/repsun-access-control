import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/types/database.types';

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
  const { data, error } = await supabase
    .from('produtos')
    .insert(produto)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar produto:', error);
    throw new Error('Erro ao criar produto');
  }

  return data;
};

/**
 * Atualiza um produto existente (apenas admin)
 */
export const updateProduto = async (id: string, produto: Partial<Omit<Produto, 'id' | 'created_at' | 'updated_at'>>): Promise<Produto> => {
  const { data, error } = await supabase
    .from('produtos')
    .update({ ...produto, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar produto:', error);
    throw new Error('Erro ao atualizar produto');
  }

  return data;
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
    throw new Error('Erro ao excluir produto');
  }
};

/**
 * Faz upload de uma imagem para o produto
 */
export const uploadProdutoImagem = async (file: File, produtoId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${produtoId}.${fileExt}`;
  const filePath = `produtos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('produtos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    console.error('Erro ao fazer upload da imagem:', uploadError);
    throw new Error('Erro ao fazer upload da imagem');
  }

  const { data } = supabase.storage
    .from('produtos')
    .getPublicUrl(filePath);

  return data.publicUrl;
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