import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/ui/modern-card';
import { Input } from '@/components/ui/input';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  PlusCircle,
  Search,
  Loader2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Share2,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { getOrcamentos, updateOrcamentoStatus } from '@/services/orcamentoService';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";

const OrcamentosPage = () => {
  const { user, logout } = useAuth();
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<any>(null);
  const [actionType, setActionType] = useState<'status' | 'share' | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const fetchOrcamentos = async (showToast = false) => {
    try {
      setLoading(true);
      const data = await getOrcamentos();
      setOrcamentos(data);
      if (showToast) {
        toast({
          title: "Atualizado",
          description: "Lista de orçamentos atualizada."
        });
      }
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os orçamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const filteredOrcamentos = orcamentos.filter(orcamento => {
    // Filter by search term
    const searchMatch = 
      orcamento.numero.toString().includes(searchTerm) ||
      (orcamento.observacoes && orcamento.observacoes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by status
    const statusMatch = statusFilter === 'todos' || orcamento.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  const openStatusDialog = (orcamento: any) => {
    setSelectedOrcamento(orcamento);
    setNewStatus(orcamento.status || 'rascunho');
    setActionType('status');
    setDialogOpen(true);
  };

  const openShareDialog = (orcamento: any) => {
    setSelectedOrcamento(orcamento);
    setActionType('share');
    setDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selectedOrcamento || !newStatus) return;
    
    try {
      setProcessing(true);
      await updateOrcamentoStatus(selectedOrcamento.id, newStatus as any);
      
      // Update local state
      setOrcamentos(orcamentos.map(o => 
        o.id === selectedOrcamento.id ? { ...o, status: newStatus } : o
      ));
      
      toast({
        title: "Sucesso",
        description: "Status do orçamento atualizado com sucesso"
      });
      
      setDialogOpen(false);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case 'aprovado': return 'default';
      case 'enviado': return 'secondary';
      case 'rejeitado': return 'destructive';
      case 'cancelado': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'aprovado': return <CheckCircle className="h-3 w-3" />;
      case 'enviado': return <Clock className="h-3 w-3" />;
      case 'rejeitado': return <XCircle className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

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
                  Orçamentos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie todos os seus orçamentos
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchOrcamentos(true)}
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Atualizar
                    </>
                  )}
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90">
                  <Link to="/orcamentos/novo" className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Novo Orçamento
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-6 animate-slide-up">
            <ModernCard variant="glass">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por número ou observações..."
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <Select 
                      value={statusFilter} 
                      onValueChange={handleStatusFilterChange}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="rejeitado">Rejeitado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[0,1,2,3,4].map((i) => (
                      <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="p-4 rounded-lg border border-border/50 bg-background/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredOrcamentos.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOrcamentos.map((orcamento, index) => (
                      <div 
                        key={orcamento.id}
                        className="animate-slide-up hover-scale p-4 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-all duration-200"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">#{orcamento.numero}</p>
                                <Badge variant={getStatusVariant(orcamento.status)} className="flex items-center gap-1">
                                  {getStatusIcon(orcamento.status)}
                                  {orcamento.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(orcamento.created_at)} • Cliente {orcamento.cliente_id.substring(0, 8)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold text-lg">
                                {formatCurrency(orcamento.valor_total)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/orcamentos/${orcamento.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="1" />
                                      <circle cx="12" cy="5" r="1" />
                                      <circle cx="12" cy="19" r="1" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/orcamentos/editar/${orcamento.id}`} className="cursor-pointer flex items-center">
                                      <FileText className="mr-2 h-4 w-4" />
                                      Editar
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openStatusDialog(orcamento)} className="cursor-pointer">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Alterar Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openShareDialog(orcamento)} className="cursor-pointer">
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Compartilhar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/orcamentos/${orcamento.id}/pdf`} className="cursor-pointer flex items-center">
                                      <Download className="mr-2 h-4 w-4" />
                                      Gerar PDF
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 animate-slide-up">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/20 mx-auto mb-4">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm || statusFilter !== 'todos' ? 
                        'Nenhum orçamento encontrado' : 
                        'Nenhum orçamento cadastrado'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || statusFilter !== 'todos' ?
                        'Tente ajustar os filtros de busca' :
                        'Comece criando seu primeiro orçamento'}
                    </p>
                    {!searchTerm && statusFilter === 'todos' && (
                      <Button asChild>
                        <Link to="/orcamentos/novo">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Criar Orçamento
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ModernCard>
          </div>
        </main>

        {/* Status Change Dialog */}
        {actionType === 'status' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar Status do Orçamento</DialogTitle>
                <DialogDescription>
                  Altere o status do orçamento #{selectedOrcamento?.numero}
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
                  onClick={() => setDialogOpen(false)}
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
        )}

        {/* Share Dialog */}
        {actionType === 'share' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compartilhar Orçamento</DialogTitle>
                <DialogDescription>
                  Escolha como deseja compartilhar o orçamento #{selectedOrcamento?.numero}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <Button className="w-full flex items-center justify-center gap-2">
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
                  onClick={() => setDialogOpen(false)}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SidebarProvider>
  );
};

export default OrcamentosPage;