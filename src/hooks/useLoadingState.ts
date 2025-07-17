import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { handleSupabaseError } from '@/utils/errorHandler';

/**
 * Hook para gerenciar estados de carregamento e erros
 * @param initialState Estado inicial de carregamento
 * @returns Estado de carregamento e funções para gerenciá-lo
 */
export function useLoadingState(initialState = false) {
  const [loading, setLoading] = useState(initialState);
  
  /**
   * Executa uma função assíncrona com tratamento de estado de carregamento
   * @param fn Função assíncrona a ser executada
   * @param successMessage Mensagem de sucesso (opcional)
   * @param errorMessage Mensagem de erro personalizada (opcional)
   * @returns Resultado da função ou null em caso de erro
   */
  const executeWithLoading = useCallback(async <T>(
    fn: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    setLoading(true);
    
    try {
      const result = await fn();
      
      if (successMessage) {
        toast({
          title: "Sucesso",
          description: successMessage
        });
      }
      
      return result;
    } catch (error) {
      const appError = handleSupabaseError(error);
      
      toast({
        title: "Erro",
        description: errorMessage || appError.message,
        variant: "destructive"
      });
      
      console.error('Erro tratado:', appError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { loading, executeWithLoading };
}