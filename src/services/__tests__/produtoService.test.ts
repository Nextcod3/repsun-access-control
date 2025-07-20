import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { 
  getProdutos, 
  getProdutoById, 
  searchProdutos, 
  createProduto, 
  updateProduto, 
  deleteProduto,
  getProdutoPreco,
  verificarImagemUrl
} from '../produtoService';
import { supabase } from '@/integrations/supabase/client';

// Mock do cliente Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis()
  }
}));

// Mock do fetch global
global.fetch = jest.fn();

describe('produtoService', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('getProdutos', () => {
    it('deve retornar lista de produtos', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockProdutos, error: null })
        })
      });

      const result = await getProdutos();
      
      expect(supabase.from).toHaveBeenCalledWith('produtos');
      expect(result).toEqual(mockProdutos);
    });

    it('deve lançar erro quando a requisição falhar', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Erro ao buscar produtos' } })
        })
      });

      await expect(getProdutos()).rejects.toThrow('Erro ao buscar produtos');
    });
  });

  describe('getProdutoById', () => {
    it('deve retornar um produto pelo ID', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockProdutos[0], error: null })
          })
        })
      });

      const result = await getProdutoById('1');
      
      expect(supabase.from).toHaveBeenCalledWith('produtos');
      expect(result).toEqual(mockProdutos[0]);
    });

    it('deve lançar erro quando a requisição falhar', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Erro ao buscar produto' } })
          })
        })
      });

      await expect(getProdutoById('1')).rejects.toThrow('Erro ao buscar produto');
    });
  });

  describe('searchProdutos', () => {
    it('deve buscar produtos por nome', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockProdutos[0]], error: null })
          })
        })
      });

      const result = await searchProdutos('Produto 1');
      
      expect(supabase.from).toHaveBeenCalledWith('produtos');
      expect(result).toEqual([mockProdutos[0]]);
    });

    it('deve lançar erro quando a requisição falhar', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Erro ao buscar produtos' } })
          })
        })
      });

      await expect(searchProdutos('Produto 1')).rejects.toThrow('Erro ao buscar produtos');
    });
  });

  describe('createProduto', () => {
    const novoProduto = {
      nome: 'Novo Produto',
      descricao: 'Nova Descrição',
      preco_sp: 300,
      preco_sul_sudeste: 310,
      preco_outros: 320
    };

    it('deve criar um novo produto', async () => {
      const produtoCriado = { ...novoProduto, id: '3', created_at: '2025-07-19T00:00:00Z', updated_at: '2025-07-19T00:00:00Z' };
      
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: produtoCriado, error: null })
          })
        })
      });

      const result = await createProduto(novoProduto);
      
      expect(supabase.from).toHaveBeenCalledWith('produtos');
      expect(result).toEqual(produtoCriado);
    });

    it('deve lançar erro quando a requisição falhar por falta de permissão', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'new row violates row-level security policy' } 
            })
          })
        })
      });

      await expect(createProduto(novoProduto)).rejects.toThrow('Permissão negada: apenas administradores podem criar produtos');
    });
  });

  describe('getProdutoPreco', () => {
    it('deve retornar o preço do produto com base na UF', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: 100, error: null });

      const result = await getProdutoPreco('1', 'SP');
      
      expect(supabase.rpc).toHaveBeenCalledWith('get_produto_preco', {
        produto_id: '1',
        uf: 'SP'
      });
      expect(result).toBe(100);
    });

    it('deve lançar erro quando a requisição falhar', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: { message: 'Erro ao obter preço do produto' } });

      await expect(getProdutoPreco('1', 'SP')).rejects.toThrow('Erro ao obter preço do produto');
    });
  });
});
  describ
e('verificarImagemUrl', () => {
    it('deve retornar true para uma URL de imagem válida', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        headers: {
          get: jest.fn().mockReturnValue('image/jpeg')
        }
      });

      const result = await verificarImagemUrl('http://example.com/image.jpg');
      
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/image.jpg', { method: 'HEAD' });
      expect(result).toBe(true);
    });

    it('deve retornar false para uma URL que não é de imagem', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        headers: {
          get: jest.fn().mockReturnValue('text/html')
        }
      });

      const result = await verificarImagemUrl('http://example.com/page.html');
      
      expect(result).toBe(false);
    });

    it('deve retornar false quando ocorre um erro', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Erro de rede'));

      const result = await verificarImagemUrl('http://invalid-url');
      
      expect(result).toBe(false);
    });
  });