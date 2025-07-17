import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/types/database.types';
import * as bcrypt from 'bcryptjs';

export type Usuario = Tables<'users'>;

/**
 * Busca todos os usuários (apenas para admin)
 */
export const getUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error('Erro ao buscar usuários');
  }

  return data || [];
};

/**
 * Busca um usuário pelo ID
 */
export const getUsuarioById = async (id: string): Promise<Usuario | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar usuário:', error);
    throw new Error('Erro ao buscar usuário');
  }

  return data;
};

/**
 * Busca um usuário pelo email
 */
export const getUsuarioByEmail = async (email: string): Promise<Usuario | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
    console.error('Erro ao buscar usuário:', error);
    throw new Error('Erro ao buscar usuário');
  }

  return data || null;
};

/**
 * Cria um novo usuário
 */
export const createUsuario = async (
  nome: string,
  email: string,
  senha: string,
  perfil: 'admin' | 'usuario' = 'usuario',
  status: boolean = false
): Promise<Usuario> => {
  // Verificar se o email já existe
  const usuarioExistente = await getUsuarioByEmail(email);
  if (usuarioExistente) {
    throw new Error('Este email já está cadastrado');
  }

  // Criptografar senha
  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash(senha, salt);

  const { data, error } = await supabase
    .from('users')
    .insert({
      nome,
      email,
      senha_hash: senhaHash,
      perfil,
      status
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar usuário:', error);
    throw new Error('Erro ao criar usuário');
  }

  return data;
};

/**
 * Atualiza um usuário existente
 */
export const updateUsuario = async (
  id: string,
  updates: Partial<Omit<Usuario, 'id' | 'created_at' | 'updated_at' | 'senha_hash'>>
): Promise<Usuario> => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw new Error('Erro ao atualizar usuário');
  }

  return data;
};

/**
 * Atualiza a senha de um usuário
 */
export const updateSenha = async (id: string, novaSenha: string): Promise<void> => {
  // Criptografar nova senha
  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash(novaSenha, salt);

  const { error } = await supabase
    .from('users')
    .update({
      senha_hash: senhaHash,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar senha:', error);
    throw new Error('Erro ao atualizar senha');
  }
};

/**
 * Aprova um usuário (apenas para admin)
 */
export const aprovarUsuario = async (id: string): Promise<Usuario> => {
  return updateUsuario(id, { status: true });
};

/**
 * Desativa um usuário (apenas para admin)
 */
export const desativarUsuario = async (id: string): Promise<Usuario> => {
  return updateUsuario(id, { status: false });
};

/**
 * Verifica se as credenciais do usuário são válidas
 */
export const verificarCredenciais = async (
  email: string,
  senha: string
): Promise<{ valido: boolean; usuario: Usuario | null }> => {
  try {
    const usuario = await getUsuarioByEmail(email);
    
    if (!usuario) {
      return { valido: false, usuario: null };
    }
    
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    
    if (!senhaValida) {
      return { valido: false, usuario: null };
    }
    
    // Verificar se o usuário está ativo (exceto admin)
    if (usuario.perfil !== 'admin' && !usuario.status) {
      return { valido: false, usuario: null };
    }
    
    return { valido: true, usuario };
  } catch (error) {
    console.error('Erro ao verificar credenciais:', error);
    throw new Error('Erro ao verificar credenciais');
  }
};