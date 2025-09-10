import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/ui/modern-card';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { PDFPreview } from '@/components/ui/pdf-preview';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  FileText,
  Download,
  Share2,
  Eye
} from 'lucide-react';
import { getOrcamentoPDFs } from '@/services/orcamentoService';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';

const PDFViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [orcamento, setOrcamento] = useState<any>(null);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do orçamento - usando dados mockados por enquanto
      // Você pode implementar uma função específica para buscar um orçamento
      
      // Buscar PDFs existentes
      const pdfsData = await getOrcamentoPDFs(id!);
      setPdfs(pdfsData);
      
      // Dados mockados para o orçamento - você pode substituir pela busca real
      setOrcamento({
        id: id,
        numero: '001',
        valor_total: 1500.00,
        status: 'enviado',
        created_at: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do orçamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePDFGenerated = (url: string) => {
    // Atualizar lista de PDFs quando um novo for gerado
    fetchData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Orçamento não encontrado</h1>
          <Button asChild className="mt-4">
            <Link to="/orcamentos">Voltar para Orçamentos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-background/80">
        <UserSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <Button asChild variant="ghost" size="sm">
                <Link to="/orcamentos" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {loading ? (
                    <Skeleton className="h-8 w-48" />
                  ) : (
                    `PDF Orçamento #${orcamento?.numero}`
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    `Geração e preview do PDF`
                  )}
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-6 animate-slide-up">
            {loading ? (
              <div className="space-y-6">
                <ModernCard variant="glass">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                    </div>
                  </div>
                </ModernCard>
                <ModernCard variant="glass">
                  <Skeleton className="h-96 w-full" />
                </ModernCard>
              </div>
            ) : (
              <>
                {/* Summary Card */}
                <ModernCard variant="glass" className="animate-slide-up">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Resumo do Orçamento
                      </h2>
                      <Button asChild variant="outline">
                        <Link to={`/orcamentos/${id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="text-sm text-muted-foreground">Número</div>
                        <div className="text-2xl font-bold text-primary">#{orcamento.numero}</div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                        <div className="text-sm text-muted-foreground">Valor Total</div>
                        <div className="text-2xl font-bold text-success">
                          {formatCurrency(orcamento.valor_total)}
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="text-2xl font-bold text-accent-foreground capitalize">
                          {orcamento.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </ModernCard>

                {/* PDF Preview */}
                <PDFPreview
                  orcamentoId={id}
                  orcamentoNumero={orcamento.numero}
                  onPDFGenerated={handlePDFGenerated}
                />

                {/* PDF History */}
                {pdfs.length > 0 && (
                  <ModernCard variant="glass" className="animate-slide-up">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Histórico de PDFs
                      </h3>
                      
                      <div className="space-y-3">
                        {pdfs.map((pdf) => (
                          <div 
                            key={pdf.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">Versão #{pdf.versao}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(pdf.created_at)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button asChild variant="outline" size="sm">
                                <a 
                                  href={pdf.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  Visualizar
                                </a>
                              </Button>
                              <Button asChild variant="outline" size="sm">
                                <a 
                                  href={pdf.url} 
                                  download={`orcamento_${orcamento.numero}_v${pdf.versao}.pdf`}
                                  className="flex items-center gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Baixar
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ModernCard>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PDFViewPage;