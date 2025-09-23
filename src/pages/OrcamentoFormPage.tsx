import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { Button } from '@/components/ui/button';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '@/components/ui/modern-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Search,
  Plus,
  Trash2,
  User,
  Package,
  Calculator,
  ShoppingCart,
  X
} from 'lucide-react';
import { 
  createOrcamento, 
  addItemOrcamento, 
  removeItemOrcamento,
  getOrcamentoCompleto
} from '@/services/orcamentoService';
import { searchClientes, type Cliente } from '@/services/clienteService';
import { searchProdutos, getProdutoPreco, type Produto } from '@/services/produtoService';
import { toast } from '@/hooks/use-toast';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from '@/utils/format';

interface ItemOrcamento {
  id: string;
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
  produto: Produto;
}

const OrcamentoFormPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Orçamento data
  const [observacoes, setObservacoes] = useState('');
  
  // Cliente selection
  const [clienteSearchOpen, setClienteSearchOpen] = useState(false);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [clienteSearchResults, setClienteSearchResults] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteSearchLoading, setClienteSearchLoading] = useState(false);
  
  // Produto selection
  const [produtoSearchOpen, setProdutoSearchOpen] = useState(false);
  const [produtoSearchTerm, setProdutoSearchTerm] = useState('');
  const [produtoSearchResults, setProdutoSearchResults] = useState<Produto[]>([]);
  const [produtoSearchLoading, setProdutoSearchLoading] = useState(false);
  
  // Add product dialog
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState(0);
  
  // Itens do orçamento
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [valorTotal, setValorTotal] = useState(0);

  // Load data if editing
  useEffect(() => {
    if (isEditMode && id) {
      fetchOrcamento(id);
    }
  }, [id, isEditMode]);

  // Calculate total whenever items change
  useEffect(() => {
    const total = itens.reduce((sum, item) => sum + item.subtotal, 0);
    setValorTotal(total);
  }, [itens]);

  const fetchOrcamento = async (orcamentoId: string) => {
    try {
      setLoading(true);
      const data = await getOrcamentoCompleto(orcamentoId);
      
      setObservacoes(data.orcamento.observacoes || '');
      setSelectedCliente(data.cliente);
      setItens(data.itens);
      
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

  // Cliente search functions
  const handleClienteSearch = async (term: string) => {
    setClienteSearchTerm(term);
    
    if (term.length < 1) {
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
    setClienteSearchOpen(false);
    setClienteSearchTerm('');
    
    toast({
      title: "Cliente selecionado",
      description: `${cliente.nome} foi selecionado para o orçamento`,
    });
  };

  // Produto search functions
  const handleProdutoSearch = async (term: string) => {
    setProdutoSearchTerm(term);
    
    if (term.length < 1) {
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

  const handleProdutoSelect = async (produto: Produto) => {
    setSelectedProduto(produto);
    setProdutoSearchOpen(false);
    
    // Get price based on client's region
    if (selectedCliente) {
      try {
        const preco = await getProdutoPreco(produto.id, selectedCliente.uf || 'SP');
        setPrecoUnitario(preco);
      } catch (error) {
        // Fallback to default price
        setPrecoUnitario(produto.preco_sp || 0);
      }
    } else {
      setPrecoUnitario(produto.preco_sp || 0);
    }
    
    setQuantidade(1);
    setAddProductDialogOpen(true);
  };

  // Add item functions
  const handleAddItem = async () => {
    if (!selectedProduto || !selectedCliente) return;
    
    try {
      const subtotal = quantidade * precoUnitario;
      
      // Create new item
      const newItem: ItemOrcamento = {
        id: `temp-${Date.now()}`, // Temporary ID for new items
        produto_id: selectedProduto.id,
        quantidade,
        valor_unitario: precoUnitario,
        subtotal,
        produto: selectedProduto
      };
      
      setItens([...itens, newItem]);
      
      // Reset selection
      setSelectedProduto(null);
      setQuantidade(1);
      setPrecoUnitario(0);
      setProdutoSearchTerm('');
      setAddProductDialogOpen(false);
      
      toast({
        title: "Produto adicionado",
        description: `${selectedProduto.nome} foi adicionado ao orçamento`,
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

  // Remove item functions
  const handleRemoveItem = (itemId: string) => {
    const item = itens.find(i => i.id === itemId);
    setItens(itens.filter(i => i.id !== itemId));
    
    if (item) {
      toast({
        title: "Produto removido",
        description: `${item.produto.nome} foi removido do orçamento`,
      });
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
    
    if (itens.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um produto ao orçamento",
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
          observacoes
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
          description: "Orçamento criado com sucesso!"
        });
        
        navigate(`/orcamentos/${newOrcamento.id}`);
      } else {
        toast({
          title: "Sucesso",
          description: "Orçamento atualizado com sucesso!"
        });
        
        navigate(`/orcamentos/${id}`);
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

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <UserSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center animate-fade-in">
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-background/80">
        <UserSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {isEditMode ? 'Editar Orçamento' : 'Novo Orçamento'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEditMode ? 'Atualize os dados do orçamento' : 'Monte seu orçamento selecionando cliente e produtos'}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/orcamentos">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>
          </header>

          <div className="flex">
            {/* Main Content */}
            <div className="flex-1 p-6 space-y-6 animate-slide-up">
              {/* Cliente Section */}
              <ModernCard variant="glass" className="animate-fade-in">
                <ModernCardHeader>
                  <ModernCardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    Cliente
                  </ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  {selectedCliente ? (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800 dark:text-green-200">{selectedCliente.nome}</p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {formatDocument(selectedCliente.documento)} • {selectedCliente.telefone}
                          </p>
                          <p className="text-xs text-green-500 dark:text-green-500">
                            {selectedCliente.endereco} - {selectedCliente.uf}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCliente(null)}
                        className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Popover open={clienteSearchOpen} onOpenChange={setClienteSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between h-12 bg-background/50 hover:bg-background/80 border-dashed"
                        >
                          <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Selecione um cliente...</span>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Buscar cliente por nome..." 
                            value={clienteSearchTerm}
                            onValueChange={handleClienteSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {clienteSearchLoading ? (
                                <div className="flex items-center justify-center p-4">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Buscando clientes...
                                </div>
                              ) : (
                                <div className="text-center p-4">
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Nenhum cliente encontrado
                                  </p>
                                  <Button asChild size="sm" variant="outline">
                                    <Link to="/clientes/novo" target="_blank">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Cadastrar Cliente
                                    </Link>
                                  </Button>
                                </div>
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {clienteSearchResults.map((cliente) => (
                                <CommandItem
                                  key={cliente.id}
                                  value={cliente.id}
                                  onSelect={() => handleClienteSelect(cliente)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">{cliente.nome}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDocument(cliente.documento)} • {cliente.telefone}
                                      </p>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </ModernCardContent>
              </ModernCard>

              {/* Produtos Section */}
              <ModernCard variant="glass" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <ModernCardHeader>
                  <div className="flex items-center justify-between">
                    <ModernCardTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                        <Package className="h-4 w-4 text-purple-600" />
                      </div>
                      Produtos
                    </ModernCardTitle>
                    <Popover open={produtoSearchOpen} onOpenChange={setProdutoSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          disabled={!selectedCliente}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Produto
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-0" align="end">
                        <Command>
                          <CommandInput 
                            placeholder="Buscar produto por nome..." 
                            value={produtoSearchTerm}
                            onValueChange={handleProdutoSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {produtoSearchLoading ? (
                                <div className="flex items-center justify-center p-4">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Buscando produtos...
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
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                                      <Package className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">{produto.nome}</p>
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {produto.descricao || 'Sem descrição'}
                                      </p>
                                    </div>
                                    <Badge variant="secondary">
                                      {formatCurrency(produto.preco_sp || 0)}
                                    </Badge>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </ModernCardHeader>
                <ModernCardContent>
                  {itens.length > 0 ? (
                    <div className="space-y-3">
                      {itens.map((item, index) => (
                        <div 
                          key={item.id}
                          className="animate-scale-in flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-background/80 transition-all duration-200"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                              <Package className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">{item.produto.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantidade}x {formatCurrency(item.valor_unitario)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatCurrency(item.subtotal)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mx-auto mb-4">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        {selectedCliente 
                          ? 'Nenhum produto adicionado ainda'
                          : 'Selecione um cliente primeiro para adicionar produtos'
                        }
                      </p>
                    </div>
                  )}
                </ModernCardContent>
              </ModernCard>

              {/* Observações Section */}
              <ModernCard variant="glass" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <ModernCardHeader>
                  <ModernCardTitle>Observações</ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <Textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Adicione observações sobre o orçamento..."
                    rows={3}
                    className="bg-background/50"
                  />
                </ModernCardContent>
              </ModernCard>
            </div>

            {/* Sticky Summary Panel */}
            <div className="w-80 p-6 space-y-6">
              <div className="sticky top-24">
                <ModernCard variant="gradient" className="animate-slide-in-right">
                  <ModernCardHeader>
                    <ModernCardTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                        <Calculator className="h-4 w-4 text-white" />
                      </div>
                      Resumo do Orçamento
                    </ModernCardTitle>
                  </ModernCardHeader>
                  <ModernCardContent className="space-y-6">
                    {/* Client Info */}
                    {selectedCliente && (
                      <div className="space-y-2">
                        <Label className="text-white/80">Cliente</Label>
                        <div className="p-3 bg-white/10 rounded-lg backdrop-blur">
                          <p className="font-medium text-white">{selectedCliente.nome}</p>
                          <p className="text-xs text-white/70">
                            {selectedCliente.uf} • {selectedCliente.telefone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Items Summary */}
                    <div className="space-y-2">
                      <Label className="text-white/80">Itens</Label>
                      <div className="p-3 bg-white/10 rounded-lg backdrop-blur">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Produtos:</span>
                          <span className="font-medium text-white">{itens.length}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-white/80">Quantidade total:</span>
                          <span className="font-medium text-white">
                            {itens.reduce((sum, item) => sum + item.quantidade, 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="space-y-3 pt-4 border-t border-white/20">
                      <div className="flex justify-between items-center">
                        <Label className="text-white/80">Valor Total</Label>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {formatCurrency(valorTotal)}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleSaveOrcamento}
                        disabled={submitting || !selectedCliente || itens.length === 0}
                        className="w-full bg-white text-primary hover:bg-white/90"
                        size="lg"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {isEditMode ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
                          </>
                        )}
                      </Button>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>
              Configure a quantidade e preço do produto
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduto && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedProduto.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduto.descricao || 'Sem descrição'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Unitário</Label>
                  <Input
                    type="text"
                    value={formatCurrency(precoUnitario)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                      setPrecoUnitario(parseFloat(value) || 0);
                    }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Subtotal:</span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(quantidade * precoUnitario)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default OrcamentoFormPage;