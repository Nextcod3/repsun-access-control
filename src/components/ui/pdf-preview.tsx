import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/ui/modern-card';
import { 
  Download, 
  Share2, 
  Loader2, 
  FileText,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { gerarPreviewPDF, gerarPDFOrcamento, compartilharViaWhatsApp } from '@/services/pdfService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PDFPreviewProps {
  orcamentoId: string;
  orcamentoNumero: string;
  className?: string;
  onPDFGenerated?: (url: string) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  orcamentoId,
  orcamentoNumero,
  className = '',
  onPDFGenerated
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState(`Olá! Segue o orçamento #${orcamentoNumero} da RepSUN.`);

  const generatePreview = async () => {
    try {
      setLoading(true);
      const pdfBlob = await gerarPreviewPDF(orcamentoId);
      const url = URL.createObjectURL(pdfBlob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o preview do PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setGenerating(true);
      const pdfUrl = await gerarPDFOrcamento(orcamentoId);
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `orcamento_${orcamentoNumero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (onPDFGenerated) {
        onPDFGenerated(pdfUrl);
      }
      
      toast({
        title: "Sucesso",
        description: "PDF gerado e salvo com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      setGenerating(true);
      const pdfUrl = await gerarPDFOrcamento(orcamentoId);
      
      if (telefone) {
        const whatsappUrl = compartilharViaWhatsApp(telefone, mensagem, pdfUrl);
        window.open(whatsappUrl, '_blank');
      } else {
        // Copiar link para área de transferência
        await navigator.clipboard.writeText(pdfUrl);
        toast({
          title: "Link copiado",
          description: "Link do PDF copiado para a área de transferência"
        });
      }
      
      setShareDialogOpen(false);
      
      if (onPDFGenerated) {
        onPDFGenerated(pdfUrl);
      }
    } catch (error) {
      console.error('Erro ao compartilhar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar o PDF",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    generatePreview();
    
    // Cleanup: remover URL quando componente for desmontado
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [orcamentoId]);

  if (loading) {
    return (
      <ModernCard variant="glass" className={`animate-slide-up ${className}`}>
        <div className="flex items-center justify-center h-96 flex-col gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Gerando preview do PDF...</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <>
      <ModernCard variant="glass" className={`animate-slide-up ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Preview do PDF</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generatePreview}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {previewUrl ? (
            <div className="border border-border/50 rounded-lg overflow-hidden bg-background">
              <iframe
                src={previewUrl}
                className="w-full h-96"
                title={`Preview Orçamento #${orcamentoNumero}`}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 border border-border/50 rounded-lg bg-muted/20">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Não foi possível carregar o preview</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShareDialogOpen(true)}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Compartilhar
            </Button>
            <Button
              onClick={handleDownload}
              disabled={generating}
              className="bg-gradient-primary hover:opacity-95"
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Baixar PDF
            </Button>
          </div>
        </div>
      </ModernCard>

      {/* Fullscreen Preview Dialog */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview Orçamento #{orcamentoNumero}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full border border-border/50 rounded-lg"
                title={`Preview Fullscreen Orçamento #${orcamentoNumero}`}
              />
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFullscreen(false)}>
              <Minimize2 className="mr-2 h-4 w-4" />
              Fechar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShareDialogOpen(true)}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Compartilhar
            </Button>
            <Button
              onClick={handleDownload}
              disabled={generating}
              className="bg-gradient-primary hover:opacity-95"
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Baixar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Orçamento</DialogTitle>
            <DialogDescription>
              Compartilhe o orçamento #{orcamentoNumero} via WhatsApp ou copie o link
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Telefone (opcional)</label>
              <input
                type="tel"
                className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se informado, abrirá o WhatsApp diretamente
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Mensagem</label>
              <textarea
                className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                rows={3}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleShare}
              disabled={generating}
              className="bg-gradient-primary hover:opacity-95"
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              {telefone ? 'Enviar WhatsApp' : 'Copiar Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PDFPreview;