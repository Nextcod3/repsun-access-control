import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogOut, 
  ArrowLeft,
  FileText,
  Download,
  Share2,
  Edit,
  Clock,
  Loader2,
  Send
} from 'lucide-react';
import { 
  getOrcamentoCompleto, 
  updateOrcamentoStatus,
  getOrcamentoPDFs
} from '@/services/orcamentoService';
import { gerarPDFOrcamento, compartilharViaWhatsApp } from '@/services/pdfService';
import { toast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from '@/components/ui/label';

const OrcamentoDetailPage = () => {
  const { user, logout } = useAuth();
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
  const [selectedPdf, setSelectedPdf] = useState<any>(null);

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
      
      // Set initial status for dialog
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
      if (data.length > 0) {
        setSelectedPdf(data[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar PDFs:', error);
    }
  };

  const handleStatusChange = async () => {
    if (!orcamento || !newStatus) return;
    
    try {
      setProcessing(true);
      await updateOrcamentoStatus(orcamento.id, newStatus as any);
      
      // Update local state
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
      
      // Refresh PDFs list
      await fetchPdfs();
      
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso"
      });
      
      // Open PDF in new tab
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
    if (!cliente || !selectedPdf) return;
    
    try {
      const mensagem = `Olá ${cliente.nome}, segue o orçamento ${orcamento.numero} da RepSUN.`;
      const whatsappUrl = compartilharViaWhatsApp(cliente.telefone, mensagem, selectedPdf.url);
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      setShareDialogOpen(false);
    } catch (error) {
      console.error('Erro ao compartilhar via WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar via WhatsApp",
        variant: "destructive"
      });
    }
  };

  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Format document (CPF/CNPJ)
  const formatDocument = (doc: string | null) => {
    if (!doc) return '-';
    
    // CNPJ: 00.000.000/0000-00
    if (doc.length === 14) {
      return doc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }
    
    // CPF: 000.000.000-00
    if (doc.length === 11) {
      return doc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }
    
    return doc;
  };

  // Format phone
  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    
    // Remove non-numeric characters
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

  // Get status badge
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'rascunho':
        return <Badge variant="outline" className="text-gray-500 border-gray-300">Rascunho</Badge>;
      case 'enviado':
        return <Badge variant="outline" className="text-blue-500 border-blue-300">Enviado</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="text-green-500 border-green-300">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="outline" className="text-red-500 border-red-300">Rejeitado</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="text-orange-500 border-orange-300">Cancelado</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p>Carregando dados do orçamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard">
                <h1 className="text-xl font-semibold text-gray-900">RepSUN</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Bem-vindo, {user?.nome}</span>
              <Button variant="outline" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Link to="/orcamentos" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Orçamento #{orcamento?.numero}
            </h2>
            <p className="text-gray-600">
              Criado em {formatDate(orcamento?.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setStatusDialogOpen(true)}
            >
              <Clock className="h-4 w-4" />
              Status
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleGeneratePdf}
              disabled={generatingPdf}
            >
              {generatingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Gerar PDF
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShareDialogOpen(true)}
              disabled={pdfs.length === 0}
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
            <Link to={`/orcamentos/editar/${id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500">Número:</dt>
                  <dd>{orcamento?.numero}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500">Data:</dt>
                  <dd>{formatDate(orcamento?.created_at)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500">Status:</dt>
                  <dd>{getStatusBadge(orcamento?.status)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500">Valor Total:</dt>
                  <dd className="font-bold">{formatCurrency(orcamento?.valor_total)}</dd>
                </div>
                {orcamento?.data_envio && (
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Data de Envio:</dt>
                    <dd>{formatDate(orcamento?.data_envio)}</dd>
                  </div>
                )}
                {orcamento?.data_aprovacao && (
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Data de Aprovação:</dt>
                    <dd>{formatDate(orcamento?.data_aprovacao)}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium text-gray-500">Nome:</dt>
                  <dd>{cliente?.nome}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Documento:</dt>
                  <dd>{formatDocument(cliente?.documento)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Telefone:</dt>
                  <dd>{formatPhone(cliente?.telefone)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Email:</dt>
                  <dd>{cliente?.email || '-'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">UF:</dt>
                  <dd>{cliente?.uf || '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setStatusDialogOpen(true)}
              >
                <Clock className="mr-2 h-4 w-4" />
                Alterar Status
              </Button>
              <Button 
                className="w-full justify-start" 
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
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setShareDialogOpen(true)}
                disabled={pdfs.length === 0}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
              <Link to={`/orcamentos/editar/${id}`} className="w-full">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Orçamento
                </Button>
              </Link>
              {orcamento?.status === 'rascunho' && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    setNewStatus('enviado');
                    setStatusDialogOpen(true);
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Orçamento
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="itens" className="mb-6">
          <TabsList>
            <TabsTrigger value="itens">Itens do Orçamento</TabsTrigger>
            <TabsTrigger value="condicoes">Condições de Pagamento</TabsTrigger>
            <TabsTrigger value="pdfs">PDFs Gerados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="itens">
            <Card>
              <CardHeader>
                <CardTitle>Itens do Orçamento</CardTitle>
              </CardHeader>
              <CardContent>
                {itens.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Valor Unitário</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itens.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.produto.nome}</p>
                                <p className="text-sm text-gray-500">
                                  {item.produto.descricao?.substring(0, 50)}
                                  {item.produto.descricao && item.produto.descricao.length > 50 ? '...' : ''}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{item.quantidade}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.valor_unitario)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Total:
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(orcamento?.valor_total)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md bg-gray-50">
                    <p className="text-gray-500">Nenhum item adicionado ao orçamento</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="condicoes">
            <Card>
              <CardHeader>
                <CardTitle>Condições de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                {condicoes.length > 0 ? (
                  <div className="space-y-4">
                    {condicoes.map((condicao) => (
                      <Card key={condicao.id} className="bg-gray-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{condicao.descricao}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {condicao.valor_entrada && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Entrada</p>
                                <p className="font-medium">{formatCurrency(condicao.valor_entrada)}</p>
                              </div>
                            )}
                            {condicao.num_parcelas && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Parcelas</p>
                                <p className="font-medium">{condicao.num_parcelas}x de {formatCurrency(condicao.valor_parcela)}</p>
                              </div>
                            )}
                            {condicao.taxa_juros && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Taxa de Juros</p>
                                <p className="font-medium">{condicao.taxa_juros}%</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-500">Valor Total</p>
                              <p className="font-bold">{formatCurrency(condicao.valor_total)}</p>
                            </div>
                            {condicao.metodo && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Método de Pagamento</p>
                                <p className="font-medium capitalize">{condicao.metodo}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md bg-gray-50">
                    <p className="text-gray-500">Nenhuma condição de pagamento definida</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link to={`/orcamentos/${id}/pagamento`} className="w-full">
                  <Button className="w-full">
                    {condicoes.length > 0 ? 'Editar Condições de Pagamento' : 'Adicionar Condições de Pagamento'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="pdfs">
            <Card>
              <CardHeader>
                <CardTitle>PDFs Gerados</CardTitle>
              </CardHeader>
              <CardContent>
                {pdfs.length > 0 ? (
                  <div className="space-y-2">
                    {pdfs.map((pdf) => (
                      <div 
                        key={pdf.id} 
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="font-medium">Orçamento #{orcamento?.numero} - Versão {pdf.versao}</p>
                            <p className="text-sm text-gray-500">{formatDate(pdf.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPdf(pdf);
                              setShareDialogOpen(true);
                            }}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Compartilhar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(pdf.url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md bg-gray-50">
                    <p className="text-gray-500">Nenhum PDF gerado</p>
                    <Button 
                      className="mt-4"
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
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {orcamento?.observacoes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{orcamento.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </main>

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
            <Select 
              value={newStatus} 
              onValueChange={setNewStatus}
            >
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
            <Button 
              variant="outline" 
              onClick={() => setStatusDialogOpen(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleStatusChange}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
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
              Escolha como deseja compartilhar o orçamento #{orcamento?.numero}
            </DialogDescription>
          </DialogHeader>
          
          {pdfs.length > 0 && (
            <div className="py-4">
              <Label>Selecione a versão do PDF</Label>
              <Select 
                value={selectedPdf?.id || pdfs[0]?.id} 
                onValueChange={(value) => setSelectedPdf(pdfs.find(p => p.id === value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent>
                  {pdfs.map((pdf) => (
                    <SelectItem key={pdf.id} value={pdf.id}>
                      Versão {pdf.versao} - {formatDate(pdf.created_at)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="py-4 space-y-4">
            <Button 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleShareWhatsApp}
              disabled={!selectedPdf}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="h-5 w-5"
              >
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              Compartilhar via WhatsApp
            </Button>
            
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="h-5 w-5"
              >
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
              </svg>
              Enviar por Email
            </Button>
            
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="h-5 w-5"
              >
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
              </svg>
              Copiar Link
            </Button>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShareDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrcamentoDetailPage;