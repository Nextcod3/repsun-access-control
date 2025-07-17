import { z } from 'zod';

/**
 * Esquema para validação de produtos
 */
export const produtoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  imagem_url: z.string().url('URL de imagem inválida').optional().nullable(),
  preco_sp: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  preco_sul_sudeste: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  preco_outros: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
});

/**
 * Esquema para validação de produtos na criação
 */
export const createProdutoSchema = produtoSchema;

/**
 * Esquema para validação de produtos na atualização
 */
export const updateProdutoSchema = produtoSchema.partial();

/**
 * Tipo para produto baseado no esquema
 */
export type ProdutoFormValues = z.infer<typeof produtoSchema>;