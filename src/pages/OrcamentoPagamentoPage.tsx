import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  Calculator,
  Calendar,
  CreditCard,
  FileText,
  Receipt
} from 'lucide-react';
import { 
  getOrcamentoCompleto, 
  addCondicaoPagamento,
  removeCondicaoPagamento
} from '@/services/orcamentoService';
import { 
  getOpcoesPagamento,
  calcularCondicaoPagamento,
  criarCondicaoPagamento,
  gerarCronogramaPagamento
} from '@/services/pagamentoService';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OrcamentoPagamentoPage = () => {
  const { user, logout } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orcamento, setOrcamento] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [condicoes, setCondicoes] = useState<any[]>([]);
  
  const [opcoesPagamento, setOpcoesPagamento] = useState<any[]>([]);
  const [selectedOpcao, setSelectedOpcao] = useState<string>('');
  const [taxaJuros, setTaxaJuros] = useState<number>(0);
  const [valorEntrada, setValorEntrada] = useState<number>(0);
  const [metodo, setMetodo] = useState<'cartao' | 'boleto' | 'pix'>('cartao');
  
  const [previewCondicao, setPreviewCondicao] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [condicaoToDelete, setCondicaoToDelete] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchOrcamento();
      fetchOpcoesPagamento();
    }
  }, [id]);

  const fetchOrcamento = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getOrcamentoCompleto(id);
      
      setOrcamento(data.orcamento);
      setCliente(data.cliente);
      setCondicoes(data.condicoes);
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

  const fetchOpcoesPagamento = async () => {
    try {
      const data = await getOpcoesPagamento();
      setOpcoesPagamento(data);
    } catch (error) {
      console.error('Erro ao buscar opções de pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as opções de pagamento",
        variant: "destructive"
      });
    }
  };

  const handleOpcaoChange = (value: string) => {
    setSelectedOpcao(value);
    
    // Reset other values
    setTaxaJuros(0);
    
    // Find the selected option
    const opcao = opcoesPagamento.find(o => o.id === value);
    if (opcao && opcao.entrada_percentual && orcamento?.valor_total) {
      // Calculate entrada based on percentage
      const entrada = (opcao.entrada_percentual / 100) * orcamento.valor_total;
      setValorEntrada(entrada);
    } else {
      setValorEntrada(0);
    }
    
    // Generate preview
    generatePreview();
  };

  const handleTaxaJurosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setTaxaJuros(isNaN(value) ? 0 : value);
    generatePreview();
  };

  const handleValorEntradaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setValorEntrada(isNaN(value) ? 0 : value);
    generatePreview();
  };

  const generatePreview = () => {
    if (!selectedOpcao || !orcamento?.valor_total) {
      setPreviewCondicao(null);
      return;
    }
    
    const opcao = opcoesPagamento.find(o => o.id === selectedOpcao);
    if (!opcao) {
      setPreviewCondicao(null);
      return;
    }
    
    // Calculate payment conditions
    const calculo = calcularCondicaoPagamento(
      opcao,
      orcamento.valor_total,
      valorEntrada > 0 ? valorEntrada : undefined
    );
    
    // Generate payment schedule
    const cronograma = gerarCronogramaPagamento(
      opcao,
      orcamento.valor_total,
      new Date(),
      valorEntrada > 0 ? valorEntrada : undefined
    );
    
    setPreviewCondicao({
      descricao: opcao.descricao,
      valor_entrada: calculo.valorEntrada,
      num_parcelas: calculo.numParcelas,
      taxa_juros: taxaJuros > 0 ? taxaJuros : null,
      valor_parcela: calculo.valorParcela,
      valor_total: calculo.valorTotalComJuros,
      metodo,
      cronograma
    });
  };

  useEffect(() => {
    generatePreview();
  }, [selectedOpcao, taxaJuros, valorEntrada, metodo]);

  const handleAddCondicao = async () => {
    if (!id || !selectedOpcao || !orcamento?.valor_total) return;
    
    try {
      setSubmitting(true);
      
      const opcao = opcoesPagamento.find(o => o.id === selectedOpcao);
      if (!opcao) return;
      
      // Create payment condition
      const novaCondicao = await criarCondicaoPagamento(
        id,
        opcao,
        orcamento.valor_total,
        taxaJuros > 0 ? taxaJuros : undefined,
        metodo
      );
      
      // Update local state
      setCondicoes([...condicoes, novaCondicao]);
      
      // Reset form
      setSelectedOpcao('');
      setTaxaJuros(0);
      setValorEntrada(0);
      setMetodo('cartao');
      setPreviewCondicao(null);
      
      toast({
        title: "Sucesso",
        description: "Condição de pagamento adicionada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao adicionar condição de pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a condição de pagamento",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (condicao: any) => {
    setCondicaoToDelete(condicao);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCondicao = async () => {
    if (!condicaoToDelete) return;
    
    try {
      setSubmitting(true);
      
      // Delete payment condition
      await removeCondicaoPagamento(condicaoToDelete.id);
      
      // Update local state
      setCondicoes(condicoes.filter(c => c.id !== condicaoToDelete.id));
      
      toast({
        title: "Sucesso",
        description: "Condição de pagamento removida com sucesso"
      });
      
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao remover condição de pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a condição de pagamento",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
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
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted/20">
          <UserSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando dados do orçamento...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted/20">
        <UserSidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Link 
                  to="/orcamentos" 
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover-scale"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Orçamentos
                </Link>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:flex">
                  Orçamento #{orcamento?.numero}
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Condições de Pagamento
                  </h1>
                  <p className="text-muted-foreground">
                    Configure as formas de pagamento para {cliente?.nome}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Form Card */}
                <ModernCard className="animate-fade-in">
                  <ModernCardHeader>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <ModernCardTitle>Adicionar Condição de Pagamento</ModernCardTitle>
                    </div>
                  </ModernCardHeader>
                  <ModernCardContent>
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium">Opção de Pagamento</Label>
                        <Select 
                          value={selectedOpcao} 
                          onValueChange={handleOpcaoChange}
                        >
                          <SelectTrigger className="w-full mt-2 h-11">
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                          <SelectContent>
                            {opcoesPagamento.map((opcao) => (
                              <SelectItem key={opcao.id} value={opcao.id}>
                                {opcao.descricao}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Taxa de Juros (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={taxaJuros}
                            onChange={handleTaxaJurosChange}
                            placeholder="0.00"
                            className="mt-2 h-11"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Valor de Entrada (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={valorEntrada}
                            onChange={handleValorEntradaChange}
                            placeholder="0.00"
                            className="mt-2 h-11"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-3 block">Método de Pagamento</Label>
                        <RadioGroup 
                          value={metodo} 
                          onValueChange={(value) => setMetodo(value as any)}
                          className="grid grid-cols-3 gap-4"
                        >
                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="cartao" id="cartao" />
                            <Label htmlFor="cartao" className="cursor-pointer">Cartão</Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="boleto" id="boleto" />
                            <Label htmlFor="boleto" className="cursor-pointer">Boleto</Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="pix" id="pix" />
                            <Label htmlFor="pix" className="cursor-pointer">PIX</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button 
                        onClick={handleAddCondicao}
                        disabled={!previewCondicao || submitting}
                        className="w-full h-11 transition-all duration-200 hover-scale"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adicionando...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Condição de Pagamento
                          </>
                        )}
                      </Button>
                    </div>
                  </ModernCardContent>
                </ModernCard>

                {/* Preview Card */}
                {previewCondicao && (
                  <ModernCard className="animate-scale-in bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                    <ModernCardHeader>
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        <ModernCardTitle>Prévia da Condição de Pagamento</ModernCardTitle>
                      </div>
                    </ModernCardHeader>
                    <ModernCardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-3 bg-background/50 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Forma de Pagamento</p>
                          <p className="font-semibold">{previewCondicao.descricao}</p>
                        </div>
                        {previewCondicao.valor_entrada > 0 && (
                          <div className="p-3 bg-background/50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Entrada</p>
                            <p className="font-semibold text-green-600">{formatCurrency(previewCondicao.valor_entrada)}</p>
                          </div>
                        )}
                        {previewCondicao.num_parcelas > 0 && (
                          <div className="p-3 bg-background/50 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">Parcelas</p>
                            <p className="font-semibold">
                              {previewCondicao.num_parcelas}x de {formatCurrency(previewCondicao.valor_parcela)}
                            </p>
                          </div>
                        )}
                        <div className="p-3 bg-background/50 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Total</p>
                          <p className="font-semibold text-primary">{formatCurrency(previewCondicao.valor_total)}</p>
                        </div>
                      </div>
                      
                      {/* Payment Schedule Preview */}
                      {previewCondicao.cronograma && previewCondicao.cronograma.length > 0 && (
                        <div className="mt-4 p-4 bg-background/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-primary" />
                            <p className="font-medium">Cronograma de Pagamento</p>
                          </div>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {previewCondicao.cronograma.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                  {item.tipo === 'entrada' ? 'Entrada' : `${item.parcela}ª Parcela`}
                                </span>
                                <span className="font-medium">{formatCurrency(item.valor)}</span>
                                <span className="text-muted-foreground">{formatDate(item.vencimento)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </ModernCardContent>
                  </ModernCard>
                )}

                {/* Existing Conditions */}
                {condicoes.length > 0 && (
                  <ModernCard className="animate-fade-in">
                    <ModernCardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <ModernCardTitle>Condições de Pagamento Configuradas</ModernCardTitle>
                      </div>
                    </ModernCardHeader>
                    <ModernCardContent>
                      <div className="space-y-3">
                        {condicoes.map((condicao, index) => (
                          <div key={condicao.id} className="group p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 hover-scale">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                                    <p className="font-semibold">{condicao.descricao}</p>
                                  </div>
                                  {condicao.valor_entrada && condicao.valor_entrada > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Entrada</p>
                                      <p className="font-semibold text-green-600">{formatCurrency(condicao.valor_entrada)}</p>
                                    </div>
                                  )}
                                  {condicao.num_parcelas && condicao.num_parcelas > 1 && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Parcelas</p>
                                      <p className="font-semibold">
                                        {condicao.num_parcelas}x de {formatCurrency(condicao.valor_parcela)}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                                    <p className="font-semibold text-primary">{formatCurrency(condicao.valor_total)}</p>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmDelete(condicao)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <ModernCard className="sticky top-20 animate-fade-in">
                  <ModernCardHeader>
                    <div className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-primary" />
                      <ModernCardTitle>Resumo do Orçamento</ModernCardTitle>
                    </div>
                  </ModernCardHeader>
                  <ModernCardContent>
                    <dl className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <dt className="font-medium text-muted-foreground">Número:</dt>
                        <dd className="font-mono">#{orcamento?.numero}</dd>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <dt className="font-medium text-muted-foreground">Cliente:</dt>
                        <dd className="text-right font-medium">{cliente?.nome}</dd>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <dt className="font-medium text-muted-foreground">Valor Total:</dt>
                        <dd className="text-right font-bold text-primary">{formatCurrency(orcamento?.valor_total)}</dd>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <dt className="font-medium text-muted-foreground">Condições:</dt>
                        <dd>
                          <Badge variant="secondary">{condicoes.length}</Badge>
                        </dd>
                      </div>
                    </dl>
                  </ModernCardContent>
                </ModernCard>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover esta condição de pagamento?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCondicao} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                'Remover'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default OrcamentoPagamentoPage;
