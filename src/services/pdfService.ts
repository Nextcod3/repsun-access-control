import { supabase } from '@/integrations/supabase/client';
import { getOrcamentoCompleto, saveOrcamentoPDF } from './orcamentoService';
import type { Tables } from '@/types/database.types';

/**
 * Gera um PDF para o orçamento e salva no storage
 */
export const gerarPDFOrcamento = async (orcamentoId: string): Promise<string> => {
  try {
    // Buscar dados completos do orçamento
    const orcamentoCompleto = await getOrcamentoCompleto(orcamentoId);
    
    // Aqui você integraria com uma biblioteca de geração de PDF como jsPDF
    // Este é um exemplo simplificado que apenas simula a geração
    
    // Gerar um nome de arquivo único
    const fileName = `orcamento_${orcamentoId}_${Date.now()}.pdf`;
    const filePath = `orcamentos/${fileName}`;
    
    // Aqui você geraria o PDF real e faria o upload
    // Por enquanto, vamos apenas simular com um arquivo de texto
    const pdfContent = JSON.stringify(orcamentoCompleto);
    const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
    
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