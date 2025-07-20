import { useState, useEffect } from 'react';

/**
 * Hook para formatar e manipular inputs de moeda
 * @param initialValue Valor inicial em número
 * @returns Objeto com valor formatado, valor numérico e funções de manipulação
 */
export const useCurrencyInput = (initialValue: number = 0) => {
  const [formattedValue, setFormattedValue] = useState('');
  const [numericValue, setNumericValue] = useState(initialValue);

  // Formatar valor inicial
  useEffect(() => {
    setFormattedValue(formatCurrency(initialValue));
  }, [initialValue]);

  // Formatar valor como moeda (R$ 1.234,56)
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Converter string formatada para número
  const parseFormattedValue = (formatted: string): number => {
    // Remover todos os caracteres não numéricos, exceto vírgula
    const cleaned = formatted.replace(/[^\d,]/g, '');
    // Substituir vírgula por ponto para conversão para número
    const numeric = parseFloat(cleaned.replace(',', '.')) || 0;
    return numeric;
  };

  // Manipular mudança no input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Permitir apenas números, vírgula e ponto
    value = value.replace(/[^\d.,]/g, '');
    
    // Substituir ponto por nada (para permitir digitação com ponto)
    value = value.replace(/\./g, '');
    
    // Garantir apenas uma vírgula
    const commaCount = (value.match(/,/g) || []).length;
    if (commaCount > 1) {
      const parts = value.split(',');
      value = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limitar a 2 casas decimais após a vírgula
    if (value.includes(',')) {
      const [integer, decimal] = value.split(',');
      value = `${integer},${decimal.slice(0, 2)}`;
    }
    
    // Converter para número
    const numeric = parseFormattedValue(value);
    
    // Formatar para exibição
    const formatted = value ? value : '';
    
    setFormattedValue(formatted);
    setNumericValue(numeric);
  };

  return {
    formattedValue,
    numericValue,
    handleChange,
    setFormattedValue,
    setNumericValue
  };
};