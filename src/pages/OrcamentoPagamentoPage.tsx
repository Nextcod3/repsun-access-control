import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LogOut, 
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react';
import { 
  getOrcamentoCompleto, 
  addCondicaoPagamento,
  removeCondicaoPagamento
} from '@/services/orcamentoService';
import { 
  getOpcoesPagamento,
  calcularCondicaoPagamento,
  criarCondicaoPagamento
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
      taxaJuros > 0 ? taxaJuros : undefined
    );
    
    // Override entrada if manually set
    if (valorEntrada > 0) {
      calculo.valorEntrada = valorEntrada;
    }
    
    setPreviewCondicao({
      descricao: opcao.descricao,
      valor_entrada: calculo.valorEntrada,
      num_parcelas: calculo.numParcelas,
      taxa_juros: taxaJuros > 0 ? taxaJuros : null,
      valor_parcela: calculo.valorParcela,
      valor_total: calculo.valorTotalComJuros,
      metodo,
      datasParcelas: calculo.datasParcelas
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
          <Link to={`/orcamentos/${id}`} className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Condições de Pagamento
            </h2>
            <p className="text-gray-600">
              Orçamento #{orcamento?.numero} - {cliente?.nome}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Condição de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="opcao">Forma de Pagamento</Label>
                    <Select 
                      value={selectedOpcao} 
                      onValueChange={handleOpcaoChange}
                    >
                      <SelectTrigger id="opcao">
                        <SelectValue placeholder="Selecione uma forma de pagamento" />
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
                      <Label htmlFor="valorEntrada">Valor de Entrada</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          R$
                        </span>
                        <Input
                          id="valorEntrada"
                          type="number"
                          min="0"
                          step="0.01"
                          value={valorEntrada || ''}
                          onChange={handleValorEntradaChange}
                          className="pl-8"
                          disabled={!selectedOpcao}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="taxaJuros">Taxa de Juros (%)</Label>
                      <div className="relative">
                        <Input
                          id="taxaJuros"
                          type="number"
                          min="0"
                          step="0.1"
                          value={taxaJuros || ''}
                          onChange={handleTaxaJurosChange}
                          disabled={!selectedOpcao}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Método de Pagamento</Label>
                    <RadioGroup 
                      value={metodo} 
                      onValueChange={(value) => setMetodo(value as any)}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cartao" id="cartao" />
                        <Label htmlFor="cartao">Cartão de Crédito</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="boleto" id="boleto" />
                        <Label htmlFor="boleto">Boleto</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix">PIX</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button 
                    onClick={handleAddCondicao}
                    disabled={!previewCondicao || submitting}
                    className="w-full"
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
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Orçamento</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Número:</dt>
                    <dd>{orcamento?.numero}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Cliente:</dt>
                    <dd>{cliente?.nome}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Valor Total:</dt>
                    <dd className="font-bold">{formatCurrency(orcamento?.valor_total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Condições:</dt>
                    <dd>{condicoes.length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>

        {previewCondicao && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prévia da Condição de Pagamento</CardTitle>
                <Calculator className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Forma de Pagamento</p>
                  <p className="font-medium">{previewCondicao.descricao}</p>
                </div>
                {previewCondicao.valor_entrada > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Entrada</p>
                    <p className="font-medium">{formatCurrency(previewCondicao.valor_entrada)}</p>
                  </div>
                )}
                {previewCondicao.num_parcelas > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Parcelas</p>
                    <p className="font-medium">
                      {previewCondicao.num_parcelas}x de {formatCurrency(previewCondicao.valor_parcela)}
                    </p>
                  </div>
                )}
                {previewCondicao.taxa_juros > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Taxa de Juros</p>
                    <p className="font-medium">{previewCondicao.taxa_juros}%</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Valor Total</p>
                  <p className="font-bold">{formatCurrency(previewCondicao.valor_total)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Método</p>
                  <p className="font-medium capitalize">{previewCondicao.metodo}</p>
                </div>
              </div>

              {previewCondicao.datasParcelas && previewCondicao.datasParcelas.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Datas de Pagamento</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {previewCondicao.datasParcelas.map((data: Date, index: number) => (
                      <div key={index} className="border rounded p-2 text-center">
                        <p className="text-xs text-gray-500">
                          {index === 0 && previewCondicao.valor_entrada ? 'Entrada' : `Parcela ${index + (previewCondicao.valor_entrada ? 0 : 1)}`}
                        </p>
                        <p className="font-medium">{formatDate(data)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Condições de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {condicoes.length > 0 ? (
              <div className="space-y-4">
                {condicoes.map((condicao) => (
                  <Card key={condicao.id} className="bg-gray-50">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">{condicao.descricao}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => confirmDelete(condicao)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Link to={`/orcamentos/${id}`} className="w-full">
              <Button className="w-full">
                Voltar para o Orçamento
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta condição de pagamento?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCondicao}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrcamentoPagamentoPage;