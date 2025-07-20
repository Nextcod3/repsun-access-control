import { supabase } from './client';

/**
 * Autentica o usuário no Supabase usando um token personalizado
 * Esta função é usada para sincronizar o sistema de autenticação personalizado com o Supabase
 */
export const authenticateWithCustomToken = async (userId: string): Promise<boolean> => {
  try {
    // Simular uma sessão para o usuário
    // Nota: Em um ambiente de produção, você deve usar um JWT assinado com a chave secreta do Supabase
    const { data, error } = await supabase.auth.setSession({
      access_token: `fake_token_${userId}`,
      refresh_token: `fake_refresh_${userId}`,
    });

    if (error) {
      console.error('Erro ao autenticar no Supabase:', error);
      return false;
    }

    // Definir cabeçalhos personalizados para todas as requisições futuras
    supabase.headers = {
      ...supabase.headers,
      'x-user-id': userId,
    };

    return true;
  } catch (error) {
    console.error('Erro ao autenticar no Supabase:', error);
    return false;
  }
};

/**
 * Limpa a sessão do Supabase
 */
export const clearSupabaseSession = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    
    // Limpar cabeçalhos personalizados
    if (supabase.headers && 'x-user-id' in supabase.headers) {
      delete supabase.headers['x-user-id'];
    }
  } catch (error) {
    console.error('Erro ao limpar sessão do Supabase:', error);
  }
};