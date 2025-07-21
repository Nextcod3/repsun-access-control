import { customSupabase, type CondicaoPagamento } from '@/integrations/supabase/custom-client';

export interface OpcaoPagamento {
  id: string;
  descricao: string;
  entrada_percentual: number | null;
  num_parcelas: number | null;
  dias_entre_parcelas: number | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type { CondicaoPagamento };

/**
 * Busca todas as opções de pagamento disponíveis
 */
export const getOpcoesPagamento = async (): Promise<OpcaoPagamento[]> => {
  const { data, error } = await customSupabase
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
  valorEntrada?: number
): {
  valorEntrada: number;
  valorFinanciado: number;
  valorParcela: number;
  valorTotalComJuros: number;
  numParcelas: number;
  datasParcelas: Date[];
} => {
  // Determinar entrada
  let entrada = valorEntrada || 0;
  if (opcao.entrada_percentual && opcao.entrada_percentual > 0) {
    entrada = Math.max(entrada, valorTotal * (opcao.entrada_percentual / 100));
  }

  // Valor a ser financiado
  const valorFinanciado = valorTotal - entrada;
  const numParcelas = opcao.num_parcelas || 1;

  // Por enquanto, sem juros - pode ser implementado depois
  const valorParcela = valorFinanciado / numParcelas;
  const valorTotalComJuros = entrada + (valorParcela * numParcelas);

  // Gerar datas das parcelas
  const datasParcelas: Date[] = [];
  const diasEntreParcelas = opcao.dias_entre_parcelas || 30;
  const hoje = new Date();
  
  for (let i = 1; i <= numParcelas; i++) {
    const dataParcela = new Date(hoje);
    dataParcela.setDate(dataParcela.getDate() + (diasEntreParcelas * i));
    datasParcelas.push(dataParcela);
  }

  return {
    valorEntrada: entrada,
    valorFinanciado,
    valorParcela,
    valorTotalComJuros,
    numParcelas,
    datasParcelas
  };
};

/**
 * Gera um cronograma de pagamento
 */
export const gerarCronogramaPagamento = (
  opcao: OpcaoPagamento,
  valorTotal: number,
  dataInicio: Date,
  valorEntrada?: number
): Array<{
  parcela: number;
  vencimento: Date;
  valor: number;
  tipo: 'entrada' | 'parcela';
}> => {
  const cronograma = [];
  const calculo = calcularCondicaoPagamento(opcao, valorTotal, valorEntrada);
  
  // Adicionar entrada se houver
  if (calculo.valorEntrada > 0) {
    cronograma.push({
      parcela: 0,
      vencimento: new Date(dataInicio),
      valor: calculo.valorEntrada,
      tipo: 'entrada' as const
    });
  }

  // Adicionar parcelas
  const diasEntreParcelas = opcao.dias_entre_parcelas || 30;
  for (let i = 1; i <= calculo.numParcelas; i++) {
    const vencimento = new Date(dataInicio);
    vencimento.setDate(vencimento.getDate() + (diasEntreParcelas * i));
    
    cronograma.push({
      parcela: i,
      vencimento,
      valor: calculo.valorParcela,
      tipo: 'parcela' as const
    });
  }

  return cronograma;
};

/**
 * Cria uma condição de pagamento para um orçamento
 */
export const criarCondicaoPagamento = async (
  orcamentoId: string,
  opcao: OpcaoPagamento,
  valorTotal: number,
  taxaJuros?: number,
  metodo?: string
): Promise<CondicaoPagamento> => {
  // Calcular valores
  const calculo = calcularCondicaoPagamento(opcao, valorTotal);

  // Criar condição de pagamento
  const { data, error } = await customSupabase
    .from('condicoes_pagamento')
    .insert({
      orcamento_id: orcamentoId,
      descricao: opcao.descricao,
      valor_entrada: calculo.valorEntrada > 0 ? calculo.valorEntrada : null,
      num_parcelas: calculo.numParcelas > 1 ? calculo.numParcelas : null,
      taxa_juros: null, // Implementar depois se necessário
      valor_parcela: calculo.numParcelas > 1 ? calculo.valorParcela : null,
      valor_total: calculo.valorTotalComJuros,
      metodo: metodo as any || null
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar condição de pagamento:', error);
    throw new Error('Erro ao criar condição de pagamento');
  }

  return data;
};