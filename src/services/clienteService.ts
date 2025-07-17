import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/types/database.types';

export type Cliente = Tables<'clientes'>;

/**
 * Busca todos os clientes
 */
export const getClientes = async (): Promise<Cliente[]> => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    throw new Error('Erro ao buscar clientes');
  }

  return data || [];
};

/**
 * Busca um cliente pelo ID
 */
export const getClienteById = async (id: string): Promise<Cliente | null> => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar cliente:', error);
    throw new Error('Erro ao buscar cliente');
  }

  return data;
};

/**
 * Busca clientes por nome ou documento
 */
export const searchClientes = async (query: string): Promise<Cliente[]> => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .or(`nome.ilike.%${query}%,documento.ilike.%${query}%`)
    .order('nome');

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    throw new Error('Erro ao buscar clientes');
  }

  return data || [];
};

/**
 * Cria um novo cliente
 */
export const createCliente = async (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> => {
  const { data, error } = await supabase
    .from('clientes')
    .insert(cliente)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar cliente:', error);
    if (error.code === '23505') {
      throw new Error('Já existe um cliente com este documento');
    }
    throw new Error('Erro ao criar cliente');
  }

  return data;
};

/**
 * Atualiza um cliente existente
 */
export const updateCliente = async (id: string, cliente: Partial<Omit<Cliente, 'id' | 'created_at' | 'updated_at'>>): Promise<Cliente> => {
  const { data, error } = await supabase
    .from('clientes')
    .update({ ...cliente, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar cliente:', error);
    if (error.code === '23505') {
      throw new Error('Já existe um cliente com este documento');
    }
    throw new Error('Erro ao atualizar cliente');
  }

  return data;
};

/**
 * Exclui um cliente
 */
export const deleteCliente = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir cliente:', error);
    throw new Error('Erro ao excluir cliente');
  }
};