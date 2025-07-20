import { useState } from 'react';
import { 
  getProdutos, 
  deleteProduto, 
  searchProdutos,
  type Produto 
} from '@/services/produtoService';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para gerenciar operações relacionadas a produtos
 */
export const useProdutos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Carrega todos os produtos
   */
  const loadProdutos = async () => {
    try {
      setLoading(true);
      const data = await getProdutos();
      setProdutos(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca produtos por nome
   */
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      loadProdutos();
      return;
    }

    try {
      setLoading(true);
      const data = await searchProdutos(query);
      setProdutos(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao buscar produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exclui um produto
   */
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await deleteProduto(id);
      toast({
        title: 'Sucesso',
        description: 'Produto excluído com sucesso',
      });
      loadProdutos();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o produto',
        variant: 'destructive',
      });
    }
  };

  /**
   * Navega para a página de edição de produto
   */
  const handleEdit = (id: string) => {
    navigate(`/admin/produtos/editar/${id}`);
  };

  /**
   * Navega para a página de criação de produto
   */
  const handleAdd = () => {
    navigate('/admin/produtos/novo');
  };

  return {
    produtos,
    loading,
    searchQuery,
    loadProdutos,
    handleSearch,
    handleDelete,
    handleEdit,
    handleAdd
  };
};