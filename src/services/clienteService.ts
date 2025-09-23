import { customSupabase, type Cliente } from '@/integrations/supabase/custom-client';
import { notifyClienteAdicionado } from '@/services/notificationService';

export type { Cliente };

/**
 * Busca todos os clientes
 */
export const getClientes = async (): Promise<Cliente[]> => {
  const { data, error } = await customSupabase
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
  const { data, error } = await customSupabase
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
  const searchQuery = `%${query.toLowerCase()}%`;
  
  const { data, error } = await customSupabase
    .from('clientes')
    .select('*')
    .or(`nome.ilike.${searchQuery},documento.ilike.${searchQuery}`)
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
  const { data, error } = await customSupabase
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

  // Criar notificação de cliente adicionado
  try {
    await notifyClienteAdicionado(data.usuario_id, data.id, data.nome);
  } catch (notificationError) {
    console.error('Erro ao criar notificação:', notificationError);
  }

  return data;
};

/**
 * Atualiza um cliente existente
 */
export const updateCliente = async (id: string, cliente: Partial<Omit<Cliente, 'id' | 'created_at' | 'updated_at'>>): Promise<Cliente> => {
  const { data, error } = await customSupabase
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
  const { error } = await customSupabase
    .from('clientes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir cliente:', error);
    throw new Error('Erro ao excluir cliente');
  }
};