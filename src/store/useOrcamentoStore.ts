import { create } from 'zustand';
import { 
  getOrcamentoCompleto, 
  addItemOrcamento, 
  removeItemOrcamento,
  updateOrcamentoStatus
} from '@/services/orcamentoService';
import { getProdutoPreco } from '@/services/produtoService';
import { toast } from '@/components/ui/use-toast';

interface OrcamentoState {
  // Estado
  orcamento: any | null;
  cliente: any | null;
  itens: any[];
  condicoes: any[];
  loading: boolean;
  saving: boolean;
  
  // Ações
  fetchOrcamento: (id: string) => Promise<void>;
  addItem: (produtoId: string, quantidade: number, clienteUf: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  reset: () => void;
}

export const useOrcamentoStore = create<OrcamentoState>((set, get) => ({
  // Estado inicial
  orcamento: null,
  cliente: null,
  itens: [],
  condicoes: [],
  loading: false,
  saving: false,
  
  // Ações
  fetchOrcamento: async (id: string) => {
    try {
      set({ loading: true });
      const data = await getOrcamentoCompleto(id);
      
      set({
        orcamento: data.orcamento,
        cliente: data.cliente,
        itens: data.itens,
        condicoes: data.condicoes
      });
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do orçamento",
        variant: "destructive"
      });
    } finally {
      set({ loading: false });
    }
  },
  
  addItem: async (produtoId: string, quantidade: number, clienteUf: string) => {
    const { orcamento } = get();
    if (!orcamento) return;
    
    try {
      set({ saving: true });
      
      // Obter preço baseado na região do cliente
      const preco = await getProdutoPreco(produtoId, clienteUf);
      
      // Adicionar item ao orçamento
      const novoItem = await addItemOrcamento(
        orcamento.id,
        produtoId,
        quantidade,
        preco
      );
      
      // Atualizar estado local
      set(state => ({
        itens: [...state.itens, novoItem],
        orcamento: {
          ...state.orcamento,
          valor_total: (state.orcamento.valor_total || 0) + novoItem.subtotal
        }
      }));
      
      toast({
        title: "Sucesso",
        description: "Item adicionado ao orçamento"
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item ao orçamento",
        variant: "destructive"
      });
    } finally {
      set({ saving: false });
    }
  },
  
  removeItem: async (itemId: string) => {
    const { itens } = get();
    const item = itens.find(i => i.id === itemId);
    if (!item) return;
    
    try {
      set({ saving: true });
      
      // Remover item do orçamento
      await removeItemOrcamento(itemId);
      
      // Atualizar estado local
      set(state => ({
        itens: state.itens.filter(i => i.id !== itemId),
        orcamento: {
          ...state.orcamento,
          valor_total: (state.orcamento.valor_total || 0) - item.subtotal
        }
      }));
      
      toast({
        title: "Sucesso",
        description: "Item removido do orçamento"
      });
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o item do orçamento",
        variant: "destructive"
      });
    } finally {
      set({ saving: false });
    }
  },
  
  updateStatus: async (id: string, status: string) => {
    try {
      set({ saving: true });
      
      // Atualizar status do orçamento
      await updateOrcamentoStatus(id, status as any);
      
      // Atualizar estado local
      set(state => ({
        orcamento: {
          ...state.orcamento,
          status
        }
      }));
      
      toast({
        title: "Sucesso",
        description: "Status do orçamento atualizado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do orçamento",
        variant: "destructive"
      });
    } finally {
      set({ saving: false });
    }
  },
  
  reset: () => {
    set({
      orcamento: null,
      cliente: null,
      itens: [],
      condicoes: [],
      loading: false,
      saving: false
    });
  }
}));