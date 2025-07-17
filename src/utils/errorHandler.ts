import { toast } from '@/components/ui/use-toast';
import { ERROR_MESSAGES } from './constants';

/**
 * Interface para erros personalizados da aplicação
 */
export interface AppError {
  code?: string;
  message: string;
  details?: any;
}

/**
 * Trata erros do Supabase e converte para erros da aplicação
 * @param error Erro do Supabase ou qualquer outro erro
 * @returns Erro padronizado da aplicação
 */
export const handleSupabaseError = (error: any): AppError => {
  // Erros específicos do Supabase
  if (error?.code) {
    switch (error.code) {
      case '23505': // Unique violation
        if (error.message.includes('email')) {
          return { code: 'EMAIL_DUPLICATE', message: ERROR_MESSAGES.EMAIL_JA_CADASTRADO };
        }
        if (error.message.includes('documento')) {
          return { code: 'DOCUMENTO_DUPLICATE', message: ERROR_MESSAGES.DOCUMENTO_JA_CADASTRADO };
        }
        return { code: 'DUPLICATE_ENTRY', message: 'Este registro já existe' };
      
      case 'PGRST116': // Not found
        return { code: 'NOT_FOUND', message: 'Registro não encontrado' };
      
      case '23503': // Foreign key violation
        return { code: 'FOREIGN_KEY_VIOLATION', message: 'Este registro está sendo usado por outro registro' };
      
      case '42P01': // Undefined table
        return { code: 'TABLE_NOT_FOUND', message: 'Tabela não encontrada' };
      
      default:
        return { 
          code: error.code, 
          message: error.message || ERROR_MESSAGES.ERRO_INTERNO,
          details: error
        };
    }
  }
  
  // Erros personalizados da aplicação
  if (error?.message) {
    return { 
      code: 'APP_ERROR',
      message: error.message,
      details: error
    };
  }
  
  // Erros genéricos
  return { 
    code: 'UNKNOWN_ERROR',
    message: ERROR_MESSAGES.ERRO_INTERNO,
    details: error
  };
};

/**
 * Exibe uma mensagem de erro usando o toast
 * @param error Erro a ser exibido
 */
export const showErrorToast = (error: any) => {
  const appError = handleSupabaseError(error);
  
  toast({
    title: "Erro",
    description: appError.message,
    variant: "destructive"
  });
  
  // Log do erro para depuração
  console.error('Erro tratado:', appError);
};

/**
 * Trata erros em funções assíncronas
 * @param fn Função assíncrona a ser executada
 * @param errorMessage Mensagem de erro personalizada (opcional)
 * @returns Resultado da função ou null em caso de erro
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const appError = handleSupabaseError(error);
    
    toast({
      title: "Erro",
      description: errorMessage || appError.message,
      variant: "destructive"
    });
    
    console.error('Erro tratado:', appError);
    return null;
  }
}