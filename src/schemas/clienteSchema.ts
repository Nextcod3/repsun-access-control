import { z } from 'zod';
import { isValidDocument, isValidPhone } from '@/utils/validation';

/**
 * Esquema de validação para o formulário de cliente
 */
export const clienteSchema = z.object({
  nome: z
    .string()
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'O nome deve ter no máximo 100 caracteres' }),
  
  documento: z
    .string()
    .optional()
    .refine(val => !val || isValidDocument(val), {
      message: 'Documento inválido. Informe um CPF ou CNPJ válido'
    }),
  
  telefone: z
    .string()
    .min(10, { message: 'O telefone deve ter pelo menos 10 dígitos' })
    .refine(val => isValidPhone(val), {
      message: 'Telefone inválido'
    }),
  
  email: z
    .string()
    .email({ message: 'Email inválido' })
    .optional()
    .or(z.literal('')),
  
  endereco: z
    .string()
    .max(200, { message: 'O endereço deve ter no máximo 200 caracteres' })
    .optional()
    .or(z.literal('')),
  
  uf: z
    .string()
    .length(2, { message: 'UF inválida' }),
  
  usuario_id: z.string().uuid()
});

/**
 * Tipo derivado do esquema de validação
 */
export type ClienteFormValues = z.infer<typeof clienteSchema>;

/**
 * Esquema de validação para a busca de clientes
 */
export const clienteSearchSchema = z.object({
  query: z
    .string()
    .min(2, { message: 'Digite pelo menos 2 caracteres para buscar' })
});