import { supabase } from '@/integrations/supabase/client';
import { getOrcamentoCompleto, saveOrcamentoPDF } from './orcamentoService';
import type { Tables } from '@/types/database.types';
import jsPDF from 'jspdf';
import { formatCurrency } from '@/utils/format';

interface OrcamentoCompleto {
  orcamento: any;
  cliente: any;
  itens: any[];
  condicoes: any[];
}

/**
 * Gera o conteúdo do PDF do orçamento
 */
const generatePDFContent = (data: OrcamentoCompleto): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 30;

  // Header - Logo e título
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RepSUN', margin, yPosition);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Orçamentos', margin, yPosition + 10);
  
  // Linha separadora
  doc.line(margin, yPosition + 20, pageWidth - margin, yPosition + 20);
  yPosition += 40;

  // Informações do orçamento
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Orçamento #${data.orcamento.numero}`, margin, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${new Date(data.orcamento.created_at).toLocaleDateString('pt-BR')}`, margin, yPosition);
  doc.text(`Status: ${data.orcamento.status?.toUpperCase()}`, margin + 100, yPosition);
  yPosition += 20;

  // Informações do cliente
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Cliente:', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${data.cliente.nome}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Telefone: ${data.cliente.telefone}`, margin, yPosition);
  yPosition += 8;
  if (data.cliente.email) {
    doc.text(`Email: ${data.cliente.email}`, margin, yPosition);
    yPosition += 8;
  }
  if (data.cliente.endereco) {
    doc.text(`Endereço: ${data.cliente.endereco}`, margin, yPosition);
    yPosition += 8;
  }
  if (data.cliente.documento) {
    doc.text(`Documento: ${data.cliente.documento}`, margin, yPosition);
    yPosition += 8;
  }
  yPosition += 10;

  // Itens do orçamento
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Itens do Orçamento:', margin, yPosition);
  yPosition += 15;

  // Cabeçalho da tabela
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', margin, yPosition);
  doc.text('Qtd', margin + 80, yPosition);
  doc.text('Vlr. Unit.', margin + 110, yPosition);
  doc.text('Subtotal', margin + 150, yPosition);
  
  // Linha do cabeçalho
  doc.line(margin, yPosition + 3, pageWidth - margin, yPosition + 3);
  yPosition += 12;

  // Itens
  doc.setFont('helvetica', 'normal');
  let totalGeral = 0;
  
  data.itens.forEach((item) => {
    if (yPosition > 250) { // Nova página se necessário
      doc.addPage();
      yPosition = 30;
    }
    
    const subtotal = item.quantidade * item.valor_unitario;
    totalGeral += subtotal;
    
    doc.text(item.produto.nome, margin, yPosition);
    doc.text(item.quantidade.toString(), margin + 80, yPosition);
    doc.text(formatCurrency(item.valor_unitario), margin + 110, yPosition);
    doc.text(formatCurrency(subtotal), margin + 150, yPosition);
    yPosition += 10;
  });

  // Linha de separação antes do total
  yPosition += 5;
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL GERAL: ${formatCurrency(totalGeral)}`, margin + 100, yPosition);
  yPosition += 20;

  // Condições de pagamento
  if (data.condicoes && data.condicoes.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Condições de Pagamento:', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    data.condicoes.forEach((condicao) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.text(`• ${condicao.descricao}`, margin, yPosition);
      yPosition += 8;
      
      if (condicao.valor_entrada) {
        doc.text(`  Entrada: ${formatCurrency(condicao.valor_entrada)}`, margin + 10, yPosition);
        yPosition += 8;
      }
      
      if (condicao.num_parcelas && condicao.valor_parcela) {
        doc.text(`  ${condicao.num_parcelas}x de ${formatCurrency(condicao.valor_parcela)}`, margin + 10, yPosition);
        yPosition += 8;
      }
      
      if (condicao.metodo) {
        doc.text(`  Método: ${condicao.metodo}`, margin + 10, yPosition);
        yPosition += 8;
      }
      
      yPosition += 5;
    });
  }

  // Observações
  if (data.orcamento.observacoes) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(data.orcamento.observacoes, pageWidth - 2 * margin);
    doc.text(lines, margin, yPosition);
  }

  return doc;
};

/**
 * Gera um PDF para o orçamento e salva no storage
 */
export const gerarPDFOrcamento = async (orcamentoId: string): Promise<string> => {
  try {
    // Buscar dados completos do orçamento
    const orcamentoCompleto = await getOrcamentoCompleto(orcamentoId);
    
    // Gerar o PDF usando jsPDF
    const doc = generatePDFContent(orcamentoCompleto);
    
    // Converter para blob
    const pdfBlob = doc.output('blob');
    
    // Gerar um nome de arquivo único
    const fileName = `orcamento_${orcamentoId}_${Date.now()}.pdf`;
    const filePath = `orcamentos/${fileName}`;
    
    // Upload do arquivo para o storage
    const { error: uploadError } = await supabase.storage
      .from('orcamentos')
      .upload(filePath, pdfBlob, {
        cacheControl: '3600',
        contentType: 'application/pdf'
      });
    
    if (uploadError) {
      console.error('Erro ao fazer upload do PDF:', uploadError);
      throw new Error('Erro ao fazer upload do PDF');
    }
    
    // Obter URL pública do arquivo
    const { data } = supabase.storage
      .from('orcamentos')
      .getPublicUrl(filePath);
    
    // Salvar referência do PDF no banco de dados
    await saveOrcamentoPDF(orcamentoId, data.publicUrl);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Erro ao gerar PDF do orçamento:', error);
    throw new Error('Erro ao gerar PDF do orçamento');
  }
};

/**
 * Gera um preview do PDF sem salvar no storage
 */
export const gerarPreviewPDF = async (orcamentoId: string): Promise<Blob> => {
  try {
    // Buscar dados completos do orçamento
    const orcamentoCompleto = await getOrcamentoCompleto(orcamentoId);
    
    // Gerar o PDF usando jsPDF
    const doc = generatePDFContent(orcamentoCompleto);
    
    // Retornar como blob para preview
    return doc.output('blob');
  } catch (error) {
    console.error('Erro ao gerar preview do PDF:', error);
    throw new Error('Erro ao gerar preview do PDF');
  }
};

/**
 * Compartilha o orçamento via WhatsApp
 */
export const compartilharViaWhatsApp = (telefone: string, mensagem: string, pdfUrl: string): string => {
  // Formatar o número de telefone (remover caracteres não numéricos)
  const numeroFormatado = telefone.replace(/\D/g, '');
  
  // Criar a URL do WhatsApp
  const textoFormatado = encodeURIComponent(`${mensagem}\n\nAcesse o orçamento: ${pdfUrl}`);
  const whatsappUrl = `https://wa.me/${numeroFormatado}?text=${textoFormatado}`;
  
  return whatsappUrl;
};

/**
 * Cria um link para compartilhamento do orçamento
 */
export const criarLinkCompartilhamento = (pdfUrl: string): string => {
  // Aqui você poderia implementar uma lógica para criar um link curto ou personalizado
  // Por enquanto, retornamos apenas a URL do PDF
  return pdfUrl;
};