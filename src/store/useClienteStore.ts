import { create } from 'zustand';
import { 
  getClientes, 
  getClienteById, 
  createCliente, 
  updateCliente, 
  deleteCliente,
  searchClientes,
  Cliente
} from '@/services/clienteService';
import { toast } from '@/components/ui/use-toast';

interface ClienteState {
  // Estado
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  loading: boolean;
  saving: boolean;
  
  // Ações
  fetchClientes: () => Promise<void>;
  fetchCliente: (id: string) => Promise<void>;
  searchClientes: (query: string) => Promise<Cliente[]>;
  createCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => Promise<Cliente | null>;
  updateCliente: (id: string, cliente: Partial<Omit<Cliente, 'id' | 'created_at' | 'updated_at'>>) => Promise<Cliente | null>;
  deleteCliente: (id: string) => Promise<boolean>;
  setSelectedCliente: (cliente: Cliente | null) => void;
  reset: () => void;
}

export const useClienteStore = create<ClienteState>((set, get) => ({
  // Estado inicial
  clientes: [],
  selectedCliente: null,
  loading: false,
  saving: false,
  
  // Ações
  fetchClientes: async () => {
    try {
      set({ loading: true });
      const data = await getClientes();
      set({ clientes: data });
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive"
      });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchCliente: async (id: string) => {
    try {
      set({ loading: true });
      const cliente = await getClienteById(id);
      set({ selectedCliente: cliente });
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente",
        variant: "destructive"
      });
    } finally {
      set({ loading: false });
    }
  },
  
  searchClientes: async (query: string) => {
    try {
      set({ loading: true });
      const results = await searchClientes(query);
      return results;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a busca",
        variant: "destructive"
      });
      return [];
    } finally {
      set({ loading: false });
    }
  },
  
  createCliente: async (cliente) => {
    try {
      set({ saving: true });
      const novoCliente = await createCliente(cliente);
      
      // Atualizar estado local
      set(state => ({
        clientes: [...state.clientes, novoCliente],
        selectedCliente: novoCliente
      }));
      
      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso"
      });
      
      return novoCliente;
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      
      if (error.message === 'Já existe um cliente com este documento') {
        toast({
          title: "Erro",
          description: "Já existe um cliente com este documento",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível cadastrar o cliente",
          variant: "destructive"
        });
      }
      
      return null;
    } finally {
      set({ saving: false });
    }
  },
  
  updateCliente: async (id, cliente) => {
    try {
      set({ saving: true });
      const clienteAtualizado = await updateCliente(id, cliente);
      
      // Atualizar estado local
      set(state => ({
        clientes: state.clientes.map(c => c.id === id ? clienteAtualizado : c),
        selectedCliente: state.selectedCliente?.id === id ? clienteAtualizado : state.selectedCliente
      }));
      
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso"
      });
      
      return clienteAtualizado;
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error);
      
      if (error.message === 'Já existe um cliente com este documento') {
        toast({
          title: "Erro",
          description: "Já existe um cliente com este documento",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o cliente",
          variant: "destructive"
        });
      }
      
      return null;
    } finally {
      set({ saving: false });
    }
  },
  
  deleteCliente: async (id) => {
    try {
      set({ saving: true });
      await deleteCliente(id);
      
      // Atualizar estado local
      set(state => ({
        clientes: state.clientes.filter(c => c.id !== id),
        selectedCliente: state.selectedCliente?.id === id ? null : state.selectedCliente
      }));
      
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente",
        variant: "destructive"
      });
      
      return false;
    } finally {
      set({ saving: false });
    }
  },
  
  setSelectedCliente: (cliente) => {
    set({ selectedCliente: cliente });
  },
  
  reset: () => {
    set({
      selectedCliente: null,
      loading: false,
      saving: false
    });
  }
}));