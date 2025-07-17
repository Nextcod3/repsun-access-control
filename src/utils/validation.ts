/**
 * Utilitários para validação de dados
 */

/**
 * Valida um endereço de e-mail
 * @param email Email a ser validado
 * @returns true se o email for válido, false caso contrário
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida um CPF
 * @param cpf CPF a ser validado (com ou sem formatação)
 * @returns true se o CPF for válido, false caso contrário
 */
export const isValidCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const numericCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (numericCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numericCPF)) return false;
  
  // Validação do dígito verificador
  let sum = 0;
  let remainder;
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numericCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numericCPF.substring(9, 10))) return false;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numericCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numericCPF.substring(10, 11))) return false;
  
  return true;
};

/**
 * Valida um CNPJ
 * @param cnpj CNPJ a ser validado (com ou sem formatação)
 * @returns true se o CNPJ for válido, false caso contrário
 */
export const isValidCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const numericCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (numericCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numericCNPJ)) return false;
  
  // Validação do dígito verificador
  let size = numericCNPJ.length - 2;
  let numbers = numericCNPJ.substring(0, size);
  const digits = numericCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  // Primeiro dígito verificador
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Segundo dígito verificador
  size += 1;
  numbers = numericCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

/**
 * Valida um documento (CPF ou CNPJ)
 * @param doc Documento a ser validado (com ou sem formatação)
 * @returns true se o documento for válido, false caso contrário
 */
export const isValidDocument = (doc: string): boolean => {
  // Remove caracteres não numéricos
  const numericDoc = doc.replace(/\D/g, '');
  
  if (numericDoc.length === 11) {
    return isValidCPF(numericDoc);
  } else if (numericDoc.length === 14) {
    return isValidCNPJ(numericDoc);
  }
  
  return false;
};

/**
 * Valida um número de telefone
 * @param phone Telefone a ser validado (com ou sem formatação)
 * @returns true se o telefone for válido, false caso contrário
 */
export const isValidPhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const numericPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (telefone fixo ou celular)
  return numericPhone.length === 10 || numericPhone.length === 11;
};