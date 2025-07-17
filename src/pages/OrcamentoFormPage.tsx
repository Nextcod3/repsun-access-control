import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  LogOut, 
  ArrowLeft,
  Save,
  Loader2,
  Search,
  Plus,
  Trash2,
  ChevronRight,
  Package,
  User
} from 'lucide-react';
import { 
  createOrcamento, 
  addItemOrcamento, 
  removeItemOrcamento,
  getOrcamentoCompleto
} from '@/services/orcamentoService';
import { getClientes, searchClientes, Cliente } from '@/services/clienteService';
import { searchProdutos, getProdutoPreco, Produto } from '@/services/produtoService';
import { toast } from '@/components/ui/use-toast';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const OrcamentoFormPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Cliente, 2: Produtos, 3: Condições
  
  // Orçamento data
  const [orcamento, setOrcamento] = useState<any>({
    cliente_id: '',
    usuario_id: user?.id || '',
    observacoes: '',
    status: 'rascunho'
  });
  
  // Cliente selection
  const [clienteSearchOpen, setClienteSearchOpen] = useState(false);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [clienteSearchResults, setClienteSearchResults] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteSearchLoading, setClienteSearchLoading] = useState(false);
  
  // Produtos
  const [produtoSearchOpen, setProdutoSearchOpen] = useState(false);
  const [produtoSearchTerm, setProdutoSearchTerm] = useState('');
  const [produtoSearchResults, setProdutoSearchResults] = useState<Produto[]>([]);
  const [produtoSearchLoading, setProdutoSearchLoading] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  
  // Itens do orçamento
  const [itens, setItens] = useState<any[]>([]);
  const [valorTotal, setValorTotal] = useState(0);

  useEffect(() => {
    if (isEditMode && id) {
      fetchOrcamento(id);
    }
  }, [id]);

  const fetchOrcamento = async (orcamentoId: string) => {
    try {
      setLoading(true);
      const data = await getOrcamentoCompleto(orcamentoId);
      
      setOrcamento({
        ...data.orcamento,
        usuario_id: user?.id || ''
      });
      
      setSelectedCliente(data.cliente);
      setItens(data.itens);
      
      // Calculate total
      const total = data.itens.reduce((sum: number, item: any) => sum + item.subtotal, 0);
      setValorTotal(total);
      
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do orçamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Cliente search
  const handleClienteSearch = async (term: string) => {
    setClienteSearchTerm(term);
    
    if (term.length < 2) {
      setClienteSearchResults([]);
      return;
    }
    
    try {
      setClienteSearchLoading(true);
      const results = await searchClientes(term);
      setClienteSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setClienteSearchLoading(false);
    }
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setOrcamento({
      ...orcamento,
      cliente_id: cliente.id
    });
    setClienteSearchOpen(false);
  };

  // Produto search
  const handleProdutoSearch = async (term: string) => {
    setProdutoSearchTerm(term);
    
    if (term.length < 2) {
      setProdutoSearchResults([]);
      return;
    }
    
    try {
      setProdutoSearchLoading(true);
      const results = await searchProdutos(term);
      setProdutoSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setProdutoSearchLoading(false);
    }
  };

  const handleProdutoSelect = (produto: Produto) => {
    setSelectedProduto(produto);
    setProdutoSearchOpen(false);
  };

  // Add item to orçamento
  const handleAddItem = async () => {
    if (!selectedProduto || !selectedCliente) return;
    
    try {
      // Get price based on client's region
      const preco = await getProdutoPreco(selectedProduto.id, selectedCliente.uf || 'SP');
      
      const subtotal = quantidade * preco;
      
      // If in edit mode, add to database
      if (isEditMode && id) {
        await addItemOrcamento(id, selectedProduto.id, quantidade, preco);
      }
      
      // Add to local state
      const newItem = {
        id: Date.now().toString(), // Temporary ID for new items
        produto_id: selectedProduto.id,
        quantidade,
        valor_unitario: preco,
        subtotal,
        produto: selectedProduto
      };
      
      setItens([...itens, newItem]);
      
      // Update total
      setValorTotal(valorTotal + subtotal);
      
      // Reset selection
      setSelectedProduto(null);
      setQuantidade(1);
      setProdutoSearchTerm('');
      
      toast({
        title: "Produto adicionado",
        description: `${selectedProduto.nome} adicionado ao orçamento`
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao orçamento",
        variant: "destructive"
      });
    }
  };

  // Remove item from orçamento
  const handleRemoveItem = async (item: any) => {
    try {
      // If in edit mode, remove from database
      if (isEditMode && id) {
        await removeItemOrcamento(item.id);
      }
      
      // Remove from local state
      setItens(itens.filter(i => i.id !== item.id));
      
      // Update total
      setValorTotal(valorTotal - item.subtotal);
      
      toast({
        title: "Produto removido",
        description: "Produto removido do orçamento"
      });
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto do orçamento",
        variant: "destructive"
      });
    }
  };

  // Handle text inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrcamento({
      ...orcamento,
      [name]: value
    });
  };

  // Handle quantity change
  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantidade(value);
    }
  };

  // Save orçamento
  const handleSaveOrcamento = async () => {
    if (!selectedCliente) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para o orçamento",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (!isEditMode) {
        // Create new orçamento
        const newOrcamento = await createOrcamento(
          selectedCliente.id,
          user?.id || '',
          orcamento.observacoes
        );
        
        // Add items
        for (const item of itens) {
          await addItemOrcamento(
            newOrcamento.id,
            item.produto_id,
            item.quantidade,
            item.valor_unitario
          );
        }
        
        toast({
          title: "Sucesso",
          description: "Orçamento criado com sucesso"
        });
        
        // Navigate to next step or orçamentos list
        navigate('/orcamentos');
      } else {
        // Update existing orçamento
        // This would be implemented if needed
        
        toast({
          title: "Sucesso",
          description: "Orçamento atualizado com sucesso"
        });
        
        navigate('/orcamentos');
      }
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o orçamento",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h2>
            <p className="text-gray-600">
              {isEditMode ? 'Atualize os dados do orçamento' : 'Crie um novo orçamento'}
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-6">
          <div className="flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <User className="h-4 w-4" />
              </div>
              <span className="ml-2 font-medium">Cliente</span>
            </div>
            
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <Package className="h-4 w-4" />
              </div>
              <span className="ml-2 font-medium">Produtos</span>
            </div>
          </div>
        </div>

        {/* Step 1: Cliente */}
        {step === 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Selecione o Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Cliente</Label>
                    <div className="flex mt-1">
                      <Popover open={clienteSearchOpen} onOpenChange={setClienteSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={clienteSearchOpen}
                            className="w-full justify-between"
                          >
                            {selectedCliente ? selectedCliente.nome : "Selecione um cliente..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Buscar cliente..." 
                              value={clienteSearchTerm}
                              onValueChange={handleClienteSearch}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {clienteSearchLoading ? (
                                  <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Buscando...
                                  </div>
                                ) : (
                                  "Nenhum cliente encontrado"
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {clienteSearchResults.map((cliente) => (
                                  <CommandItem
                                    key={cliente.id}
                                    value={cliente.id}
                                    onSelect={() => handleClienteSelect(cliente)}
                                  >
                                    <div className="flex flex-col">
                                      <span>{cliente.nome}</span>
                                      <span className="text-xs text-gray-500">
                                        {formatDocument(cliente.documento)} • {cliente.telefone}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      
                      <Link to="/clientes/novo" className="ml-2">
                        <Button variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {selectedCliente && (
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Dados do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nome</p>
                          <p>{selectedCliente.nome}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Documento</p>
                          <p>{formatDocument(selectedCliente.documento)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Telefone</p>
                          <p>{selectedCliente.telefone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p>{selectedCliente.email || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-500">Endereço</p>
                          <p>{selectedCliente.endereco || '-'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link to="/orcamentos">
                <Button variant="outline">Cancelar</Button>
              </Link>
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedCliente}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Próximo
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Produtos */}
        {step === 2 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Adicione os Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Produto</Label>
                    <div className="flex mt-1">
                      <Popover open={produtoSearchOpen} onOpenChange={setProdutoSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={produtoSearchOpen}
                            className="w-full justify-between"
                          >
                            {selectedProduto ? selectedProduto.nome : "Selecione um produto..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Buscar produto..." 
                              value={produtoSearchTerm}
                              onValueChange={handleProdutoSearch}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {produtoSearchLoading ? (
                                  <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Buscando...
                                  </div>
                                ) : (
                                  "Nenhum produto encontrado"
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {produtoSearchResults.map((produto) => (
                                  <CommandItem
                                    key={produto.id}
                                    value={produto.id}
                                    onSelect={() => handleProdutoSelect(produto)}
                                  >
                                    <div className="flex flex-col">
                                      <span>{produto.nome}</span>
                                      <span className="text-xs text-gray-500">
                                        {produto.descricao?.substring(0, 50)}
                                        {produto.descricao && produto.descricao.length > 50 ? '...' : ''}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-32">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={handleQuantidadeChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      onClick={handleAddItem} 
                      disabled={!selectedProduto}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Itens do Orçamento</h3>
                  
                  {itens.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                            <TableHead className="text-right">Valor Unitário</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
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
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleRemoveItem(item)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">
                              Total:
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(valorTotal)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-md bg-gray-50">
                      <p className="text-gray-500">Nenhum item adicionado ao orçamento</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    name="observacoes"
                    value={orcamento.observacoes || ''}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1"
                    placeholder="Informações adicionais sobre o orçamento..."
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSaveOrcamento} 
                disabled={itens.length === 0 || submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Orçamento
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
};

export default OrcamentoFormPage;