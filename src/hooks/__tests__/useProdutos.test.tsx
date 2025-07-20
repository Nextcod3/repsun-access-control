import { renderHook, act } from '@testing-library/react';
import { useProdutos } from '../useProdutos';
import * as produtoService from '@/services/produtoService';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

// Mock das dependências
jest.mock('@/services/produtoService');
jest.mock('@/hooks/useToast');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

describe('useProdutos', () => {
  const mockProdutos = [
    { 
      id: '1', 
      nome: 'Produto 1', 
      descricao: 'Descrição 1', 
      preco_sp: 100, 
      preco_sul_sudeste: 110, 
      preco_outros: 120,
      imagem_url: 'http://example.com/image1.jpg',
      created_at: '2025-07-19T00:00:00Z',
      updated_at: '2025-07-19T00:00:00Z'
    },
    { 
      id: '2', 
      nome: 'Produto 2', 
      descricao: 'Descrição 2', 
      preco_sp: 200, 
      preco_sul_sudeste: 210, 
      preco_outros: 220,
      imagem_url: null,
      created_at: '2025-07-19T00:00:00Z',
      updated_at: '2025-07-19T00:00:00Z'
    }
  ];

  const mockToast = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock das implementações
    (produtoService.getProdutos as jest.Mock).mockResolvedValue(mockProdutos);
    (produtoService.searchProdutos as jest.Mock).mockResolvedValue([mockProdutos[0]]);
    (produtoService.deleteProduto as jest.Mock).mockResolvedValue(undefined);
    
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    
    // Mock do window.confirm
    window.confirm = jest.fn().mockReturnValue(true);
  });

  it('deve carregar produtos corretamente', async () => {
    const { result } = renderHook(() => useProdutos());
    
    await act(async () => {
      await result.current.loadProdutos();
    });
    
    expect(produtoService.getProdutos).toHaveBeenCalledTimes(1);
    expect(result.current.produtos).toEqual(mockProdutos);
    expect(result.current.loading).toBe(false);
  });

  it('deve exibir toast de erro quando falhar ao carregar produtos', async () => {
    (produtoService.getProdutos as jest.Mock).mockRejectedValue(new Error('Erro ao carregar'));
    
    const { result } = renderHook(() => useProdutos());
    
    await act(async () => {
      await result.current.loadProdutos();
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Erro',
      description: 'Não foi possível carregar os produtos',
      variant: 'destructive',
    });
    expect(result.current.loading).toBe(false);
  });

  it('deve buscar produtos corretamente', async () => {
    const { result } = renderHook(() => useProdutos());
    
    await act(async () => {
      await result.current.handleSearch('Produto 1');
    });
    
    expect(produtoService.searchProdutos).toHaveBeenCalledWith('Produto 1');
    expect(result.current.searchQuery).toBe('Produto 1');
    expect(result.current.produtos).toEqual([mockProdutos[0]]);
  });

  it('deve carregar todos os produtos quando a busca estiver vazia', async () => {
    const { result } = renderHook(() => useProdutos());
    
    await act(async () => {
      await result.current.handleSearch('');
    });
    
    expect(produtoService.getProdutos).toHaveBeenCalledTimes(1);
    expect(result.current.searchQuery).toBe('');
  });

  it('deve excluir produto corretamente', async () => {
    const { result } = renderHook(() => useProdutos());
    
    await act(async () => {
      await result.current.handleDelete('1');
    });
    
    expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir este produto?');
    expect(produtoService.deleteProduto).toHaveBeenCalledWith('1');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Sucesso',
      description: 'Produto excluído com sucesso',
    });
    expect(produtoService.getProdutos).toHaveBeenCalledTimes(1);
  });

  it('não deve excluir produto se o usuário cancelar a confirmação', async () => {
    (window.confirm as jest.Mock).mockReturnValue(false);
    
    const { result } = renderHook(() => useProdutos());
    
    await act(async () => {
      await result.current.handleDelete('1');
    });
    
    expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir este produto?');
    expect(produtoService.deleteProduto).not.toHaveBeenCalled();
  });

  it('deve navegar para a página de edição corretamente', () => {
    const { result } = renderHook(() => useProdutos());
    
    act(() => {
      result.current.handleEdit('1');
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/admin/produtos/editar/1');
  });

  it('deve navegar para a página de criação corretamente', () => {
    const { result } = renderHook(() => useProdutos());
    
    act(() => {
      result.current.handleAdd();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/admin/produtos/novo');
  });
});