import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  FileText,
  Download,
  Share2,
  Edit,
  Clock,
  Loader2,
  Send,
  User,
  Package,
  Calculator,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { 
  getOrcamentoCompleto, 
  updateOrcamentoStatus,
  getOrcamentoPDFs
} from '@/services/orcamentoService';
import { gerarPDFOrcamento, compartilharViaWhatsApp } from '@/services/pdfService';
import { WhatsAppShare } from '@/components/ui/whatsapp-share';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatCurrency } from '@/utils/format';

const OrcamentoDetailPage = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [orcamento, setOrcamento] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [condicoes, setCondicoes] = useState<any[]>([]);
  const [pdfs, setPdfs] = useState<any[]>([]);
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrcamento();
      fetchPdfs();
    }
  }, [id]);

  const fetchOrcamento = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getOrcamentoCompleto(id);
      
      setOrcamento(data.orcamento);
      setCliente(data.cliente);
      setItens(data.itens);
      setCondicoes(data.condicoes);
      
      setNewStatus(data.orcamento.status || 'rascunho');
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do orçamento",
        variant: "destructive"
      });
      navigate('/orcamentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPdfs = async () => {
    if (!id) return;
    
    try {
      const data = await getOrcamentoPDFs(id);
      setPdfs(data);
    } catch (error) {
      console.error('Erro ao buscar PDFs:', error);
    }
  };

  const handleStatusChange = async () => {
    if (!orcamento || !newStatus) return;
    
    try {
      setProcessing(true);
      await updateOrcamentoStatus(orcamento.id, newStatus as any);
      
      setOrcamento({
        ...orcamento,
        status: newStatus
      });
      
      toast({
        title: "Sucesso",
        description: "Status do orçamento atualizado com sucesso"
      });
      
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do orçamento",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!id) return;
    
    try {
      setGeneratingPdf(true);
      const pdfUrl = await gerarPDFOrcamento(id);
      
      await fetchPdfs();
      
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso"
      });
      
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!cliente || pdfs.length === 0) return;
    
    try {
      const mensagem = `Olá ${cliente.nome}, segue o orçamento #${orcamento.numero} da RepSUN.`;
      const whatsappUrl = compartilharViaWhatsApp(cliente.telefone, mensagem, pdfs[0].url);
      
      window.open(whatsappUrl, '_blank');
      setShareDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Redirecionado para WhatsApp"
      });
    } catch (error) {
      console.error('Erro ao compartilhar via WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar via WhatsApp",
        variant: "destructive"
      });
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Format document (CPF/CNPJ)
  const formatDocument = (doc: string | null) => {
    if (!doc) return '-';
    
    if (doc.length === 14) {
      return doc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }
    
    if (doc.length === 11) {
      return doc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }
    
    return doc;
  };

  // Format phone
  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    
    const numericPhone = phone.replace(/\D/g, '');
    
    if (numericPhone.length === 11) {
      return numericPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (numericPhone.length === 10) {
      return numericPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }
    
    return phone;
  };

  // Get status info
  const getStatusInfo = (status: string | null) => {
    switch (status) {
      case 'rascunho':
        return { 
          variant: 'outline' as const, 
          icon: <FileText className="h-3 w-3" />, 
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
      case 'enviado':
        return { 
          variant: 'secondary' as const, 
          icon: <Clock className="h-3 w-3" />, 
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200'
        };
      case 'aprovado':
        return { 
          variant: 'default' as const, 
          icon: <CheckCircle className="h-3 w-3" />, 
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'rejeitado':
        return { 
          variant: 'destructive' as const, 
          icon: <XCircle className="h-3 w-3" />, 
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      default:
        return { 
          variant: 'outline' as const, 
          icon: <AlertCircle className="h-3 w-3" />, 
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <UserSidebar />
          <main className="flex-1">
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger />
                <div className="flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </div>
              </div>
            </header>
            <div className="p-6 space-y-6">
              {[0,1,2,3].map((i) => (
                <ModernCard key={i} variant="glass">
                  <Skeleton className="h-64 w-full" />
                </ModernCard>
              ))}
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const statusInfo = getStatusInfo(orcamento?.status);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-background/80">
        <UserSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Orçamento #{orcamento?.numero}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Criado em {formatDate(orcamento?.created_at)}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                  {statusInfo.icon}
                  {orcamento?.status || 'rascunho'}
                </Badge>
                
                <Button variant="outline" asChild>
                  <Link to="/orcamentos">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6 animate-slide-up">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Orçamento Info */}
              <ModernCard variant="glass" className="animate-fade-in">
                <ModernCardHeader>
                  <ModernCardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <Calculator className="h-4 w-4 text-blue-600" />
                    </div>
                    Informações
                  </ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Número:</span>
                    <span className="font-medium">#{orcamento?.numero}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Data:</span>
                    <span className="font-medium">{formatDate(orcamento?.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                      {statusInfo.icon}
                      {orcamento?.status || 'rascunho'}
                    </Badge>
                  </div>
                  <div className="pt-3 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Valor Total:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(orcamento?.valor_total || 0)}
                      </span>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>

              {/* Cliente Info */}
              <ModernCard variant="glass" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <ModernCardHeader>
                  <ModernCardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    Cliente
                  </ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{cliente?.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatDocument(cliente?.documento)}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{formatPhone(cliente?.telefone)}</span>
                  </div>
                  {cliente?.endereco && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{cliente?.endereco}</p>
                        <p className="text-xs text-muted-foreground">{cliente?.uf}</p>
                      </div>
                    </div>
                  )}
                </ModernCardContent>
              </ModernCard>

              {/* Actions */}
              <ModernCard variant="gradient" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <ModernCardHeader>
                  <ModernCardTitle className="text-white flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                      <Send className="h-4 w-4 text-white" />
                    </div>
                    Ações Rápidas
                  </ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent className="space-y-3">
                  <Button 
                    className="w-full bg-white/20 text-white hover:bg-white/30 border-white/20"
                    variant="outline"
                    onClick={() => setStatusDialogOpen(true)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Alterar Status
                  </Button>
                  
                  <Button 
                    className="w-full bg-white/20 text-white hover:bg-white/30 border-white/20"
                    variant="outline"
                    onClick={handleGeneratePdf}
                    disabled={generatingPdf}
                  >
                    {generatingPdf ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Gerar PDF
                  </Button>
                  
                  <Button asChild className="w-full bg-white/20 text-white hover:bg-white/30 border-white/20" variant="outline">
                    <Link to={`/orcamentos/${id}/pdf`}>
                      <FileText className="mr-2 h-4 w-4" />
                      Preview PDF
                    </Link>
                  </Button>
                  
                  <WhatsAppShare
                    cliente={cliente}
                    orcamento={orcamento}
                    pdfUrl={pdfs.length > 0 ? pdfs[0].url : undefined}
                  >
                    <Button 
                      className="w-full bg-white/20 text-white hover:bg-white/30 border-white/20"
                      variant="outline"
                      disabled={pdfs.length === 0}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartilhar
                    </Button>
                  </WhatsAppShare>
                  
                  <Button asChild className="w-full bg-white text-primary hover:bg-white/90">
                    <Link to={`/orcamentos/editar/${id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                </ModernCardContent>
              </ModernCard>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="itens" className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="itens">Itens do Orçamento</TabsTrigger>
                <TabsTrigger value="detalhes">Detalhes e Observações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="itens" className="mt-6">
                <ModernCard variant="glass">
                  <ModernCardHeader>
                    <ModernCardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      Produtos ({itens.length} {itens.length === 1 ? 'item' : 'itens'})
                    </ModernCardTitle>
                  </ModernCardHeader>
                  <ModernCardContent>
                    {itens.length > 0 ? (
                      <div className="space-y-3">
                        {itens.map((item, index) => (
                          <div 
                            key={item.id}
                            className="animate-scale-in flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                                <Package className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium">{item.produto?.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.produto?.descricao || 'Sem descrição'}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs bg-muted px-2 py-1 rounded">
                                    Qtd: {item.quantidade}
                                  </span>
                                  <span className="text-xs bg-muted px-2 py-1 rounded">
                                    Unit: {formatCurrency(item.valor_unitario)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                {formatCurrency(item.subtotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Total */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Calculator className="h-5 w-5 text-green-600" />
                              <span className="font-semibold text-green-800 dark:text-green-200">
                                Total Geral
                              </span>
                            </div>
                            <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {formatCurrency(orcamento?.valor_total || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mx-auto mb-4">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">Nenhum item encontrado neste orçamento</p>
                      </div>
                    )}
                  </ModernCardContent>
                </ModernCard>
              </TabsContent>
              
              <TabsContent value="detalhes" className="mt-6">
                <ModernCard variant="glass">
                  <ModernCardHeader>
                    <ModernCardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Detalhes e Observações
                    </ModernCardTitle>
                  </ModernCardHeader>
                  <ModernCardContent className="space-y-6">
                    {/* Timeline */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Histórico
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Orçamento criado</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(orcamento?.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        {orcamento?.data_envio && (
                          <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                              <Send className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Orçamento enviado</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(orcamento?.data_envio)}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {orcamento?.data_aprovacao && (
                          <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Orçamento aprovado</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(orcamento?.data_aprovacao)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Observações */}
                    {orcamento?.observacoes && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Observações</h4>
                        <div className="p-4 bg-background/30 rounded-lg border border-border/50">
                          <p className="text-sm whitespace-pre-wrap">{orcamento.observacoes}</p>
                        </div>
                      </div>
                    )}
                  </ModernCardContent>
                </ModernCard>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status do Orçamento</DialogTitle>
            <DialogDescription>
              Altere o status do orçamento #{orcamento?.numero}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusChange} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar'
              )}
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
              Compartilhe o orçamento com o cliente via WhatsApp
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{cliente?.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPhone(cliente?.telefone)}
                </p>
              </div>
            </div>
            
            {pdfs.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  O PDF mais recente será compartilhado via WhatsApp.
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum PDF disponível. Gere um PDF primeiro.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleShareWhatsApp}
              disabled={pdfs.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar no WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default OrcamentoDetailPage;