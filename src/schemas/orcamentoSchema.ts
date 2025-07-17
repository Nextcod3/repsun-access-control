import { z } from 'zod';

/**
 * Esquema de validação para o formulário de orçamento
 */
export const orcamentoSchema = z.object({
  cliente_id: z
    .string()
    .uuid({ message: 'Cliente inválido' }),
  
  usuario_id: z
    .string()
    .uuid(),
  
  observacoes: z
    .string()
    .max(500, { message: 'As observações devem ter no máximo 500 caracteres' })
    .optional()
    .or(z.literal(''))
});

/**
 * Tipo derivado do esquema de validação
 */
export type OrcamentoFormValues = z.infer<typeof orcamentoSchema>;

/**
 * Esquema de validação para o item de orçamento
 */
export const itemOrcamentoSchema = z.object({
  produto_id: z
    .string()
    .uuid({ message: 'Produto inválido' }),
  
  quantidade: z
    .number()
    .int({ message: 'A quantidade deve ser um número inteiro' })
    .positive({ message: 'A quantidade deve ser maior que zero' })
});

/**
 * Tipo derivado do esquema de validação
 */
export type ItemOrcamentoFormValues = z.infer<typeof itemOrcamentoSchema>;

/**
 * Esquema de validação para a condição de pagamento
 */
export const condicaoPagamentoSchema = z.object({
  opcao_id: z
    .string()
    .uuid({ message: 'Opção de pagamento inválida' }),
  
  taxa_juros: z
    .number()
    .min(0, { message: 'A taxa de juros não pode ser negativa' })
    .optional(),
  
  valor_entrada: z
    .number()
    .min(0, { message: 'O valor de entrada não pode ser negativo' })
    .optional(),
  
  metodo: z
    .enum(['cartao', 'boleto', 'pix'], { 
      invalid_type_error: 'Método de pagamento inválido',
      required_error: 'Selecione um método de pagamento'
    })
});

/**
 * Tipo derivado do esquema de validação
 */
export type CondicaoPagamentoFormValues = z.infer<typeof condicaoPagamentoSchema>;