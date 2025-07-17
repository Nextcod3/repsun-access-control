import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/types/database.types';

export type OpcaoPagamento = Tables<'opcoes_pagamento'>;
export type CondicaoPagamento = Tables<'condicoes_pagamento'>;

/**
 * Busca todas as opções de pagamento disponíveis
 */
export const getOpcoesPagamento = async (): Promise<OpcaoPagamento[]> => {
  const { data, error } = await supabase
    .from('opcoes_pagamento')
    .select('*')
    .eq('ativo', true)
    .order('descricao');

  if (error) {
    console.error('Erro ao buscar opções de pagamento:', error);
    throw new Error('Erro ao buscar opções de pagamento');
  }

  return data || [];
};

/**
 * Calcula as condições de pagamento com base na opção selecionada
 */
export const calcularCondicaoPagamento = (
  opcao: OpcaoPagamento,
  valorTotal: number,
  taxaJuros?: number
): {
  valorEntrada: number | null;
  valorParcela: number | null;
  numParcelas: number | null;
  valorTotalComJuros: number;
  datasParcelas: Date[];
} => {
  let valorEntrada: number | null = null;
  let valorParcela: number | null = null;
  let valorTotalComJuros = valorTotal;
  const datasParcelas: Date[] = [];
  const hoje = new Date();
  
  // Calcular valor de entrada se aplicável
  if (opcao.entrada_percentual) {
    valorEntrada = (opcao.entrada_percentual / 100) * valorTotal;
  }
  
  // Aplicar juros se fornecido
  if (taxaJuros && taxaJuros > 0) {
    // Taxa de juros mensal
    const taxaMensal = taxaJuros / 100;
    
    // Valor com juros (para pagamentos parcelados)
    if (opcao.num_parcelas && opcao.num_parcelas > 1) {
      // Fórmula de juros compostos para parcelas iguais
      const valorFinanciado = valorEntrada ? valorTotal - valorEntrada : valorTotal;
      
      // Fator de juros para parcelas iguais
      const fator = (Math.pow(1 + taxaMensal, opcao.num_parcelas) * taxaMensal) / 
                    (Math.pow(1 + taxaMensal, opcao.num_parcelas) - 1);
      
      valorParcela = valorFinanciado * fator;
      valorTotalComJuros = (valorParcela * opcao.num_parcelas) + (valorEntrada || 0);
    } else if (opcao.dias_entre_parcelas && opcao.dias_entre_parcelas > 0) {
      // Para pagamentos com datas específicas (30/60/90 etc.)
      valorTotalComJuros = valorTotal * Math.pow(1 + taxaMensal, opcao.num_parcelas || 1);
    }
  } else {
    // Sem juros
    if (opcao.num_parcelas && opcao.num_parcelas > 0) {
      const valorFinanciado = valorEntrada ? valorTotal - valorEntrada : valorTotal;
      valorParcela = valorFinanciado / opcao.num_parcelas;
    }
  }
  
  // Calcular datas das parcelas
  if (opcao.num_parcelas && opcao.dias_entre_parcelas) {
    let dataAtual = new Date(hoje);
    
    // Se tem entrada, a primeira parcela é hoje
    if (valorEntrada) {
      datasParcelas.push(new Date(dataAtual));
    }
    
    // Calcular datas das parcelas restantes
    for (let i = 0; i < opcao.num_parcelas; i++) {
      dataAtual = new Date(dataAtual);
      dataAtual.setDate(dataAtual.getDate() + (i === 0 ? opcao.dias_entre_parcelas : opcao.dias_entre_parcelas));
      datasParcelas.push(new Date(dataAtual));
    }
  }
  
  return {
    valorEntrada,
    valorParcela,
    numParcelas: opcao.num_parcelas,
    valorTotalComJuros,
    datasParcelas
  };
};

/**
 * Cria uma nova condição de pagamento para um orçamento
 */
export const criarCondicaoPagamento = async (
  orcamentoId: string,
  opcaoPagamento: OpcaoPagamento,
  valorTotal: number,
  taxaJuros?: number,
  metodo?: 'cartao' | 'boleto' | 'pix'
): Promise<CondicaoPagamento> => {
  const calculo = calcularCondicaoPagamento(opcaoPagamento, valorTotal, taxaJuros);
  
  const { data, error } = await supabase
    .from('condicoes_pagamento')
    .insert({
      orcamento_id: orcamentoId,
      descricao: opcaoPagamento.descricao,
      valor_entrada: calculo.valorEntrada,
      num_parcelas: calculo.numParcelas,
      taxa_juros: taxaJuros,
      valor_parcela: calculo.valorParcela,
      valor_total: calculo.valorTotalComJuros,
      metodo: metodo
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar condição de pagamento:', error);
    throw new Error('Erro ao criar condição de pagamento');
  }
  
  return data;
};