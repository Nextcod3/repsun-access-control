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
    .min(1, { message: 'Documento é obrigatório' })
    .refine(val => isValidDocument(val), {
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
    .min(1, { message: 'Email é obrigatório' })
    .email({ message: 'Email inválido' }),
  
  endereco: z
    .string()
    .min(1, { message: 'Endereço é obrigatório' })
    .max(200, { message: 'O endereço deve ter no máximo 200 caracteres' }),
  
  cidade: z
    .string()
    .min(1, { message: 'Cidade é obrigatória' })
    .max(100, { message: 'A cidade deve ter no máximo 100 caracteres' }),
  
  cep: z
    .string()
    .min(1, { message: 'CEP é obrigatório' })
    .regex(/^\d{5}-?\d{3}$/, { message: 'CEP inválido. Use o formato 00000-000' }),
  
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