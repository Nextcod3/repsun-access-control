/**
 * Utilitários para formatação de dados
 */

/**
 * Formata um valor numérico para moeda brasileira (BRL)
 * @param value Valor a ser formatado
 * @returns String formatada (ex: R$ 1.234,56)
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

/**
 * Formata uma data para o formato brasileiro
 * @param dateString String de data ou objeto Date
 * @returns String formatada (ex: 01/01/2025)
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('pt-BR');
};

/**
 * Formata um documento (CPF/CNPJ)
 * @param doc String do documento
 * @returns String formatada (ex: 123.456.789-00 ou 12.345.678/0001-90)
 */
export const formatDocument = (doc: string | null | undefined): string => {
  if (!doc) return '-';
  
  // Remove caracteres não numéricos
  const numericDoc = doc.replace(/\D/g, '');
  
  // CNPJ: 00.000.000/0000-00
  if (numericDoc.length === 14) {
    return numericDoc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }
  
  // CPF: 000.000.000-00
  if (numericDoc.length === 11) {
    return numericDoc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  
  return doc;
};

/**
 * Formata um número de telefone
 * @param phone String do telefone
 * @returns String formatada (ex: (11) 98765-4321 ou (11) 3456-7890)
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  // Remove caracteres não numéricos
  const numericPhone = phone.replace(/\D/g, '');
  
  // Format based on length
  if (numericPhone.length === 11) {
    // Celular: (00) 00000-0000
    return numericPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  } else if (numericPhone.length === 10) {
    // Fixo: (00) 0000-0000
    return numericPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  
  return phone;
};