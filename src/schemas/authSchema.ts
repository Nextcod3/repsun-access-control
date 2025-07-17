import { z } from 'zod';

/**
 * Esquema de validação para o formulário de login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email inválido' }),
  
  password: z
    .string()
    .min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
});

/**
 * Tipo derivado do esquema de validação
 */
export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Esquema de validação para o formulário de registro
 */
export const registerSchema = z.object({
  nome: z
    .string()
    .min(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'O nome deve ter no máximo 100 caracteres' }),
  
  email: z
    .string()
    .email({ message: 'Email inválido' }),
  
  password: z
    .string()
    .min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
    .max(50, { message: 'A senha deve ter no máximo 50 caracteres' })
});

/**
 * Tipo derivado do esquema de validação
 */
export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Esquema de validação para o formulário de recuperação de senha
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email inválido' })
});

/**
 * Tipo derivado do esquema de validação
 */
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;