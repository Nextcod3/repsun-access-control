import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { Card, CardContent } from '@/components/ui/card';
import SearchInput from '@/components/ui/search-input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ModernCard } from '@/components/ui/modern-card';
import { Package, Search, Eye } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { getProdutos, searchProdutos, type Produto } from '@/services/produtoService';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

/**
 * Página de visualização de produtos para usuários
 */
const ProdutosViewPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const data = await getProdutos();
      setProdutos(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      loadProdutos();
      return;
    }

    try {
      setLoading(true);
      const data = await searchProdutos(query);
      setProdutos(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao buscar produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProdutos();
  }, []);

  // Função para determinar preço baseado na UF do usuário (placeholder para agora)
  const getPrecoParaUsuario = (produto: Produto) => {
    // Por enquanto retorna o preço SP, mas isso pode ser melhorado
    // quando tivermos mais informações do usuário
    return produto.preco_sp || 0;
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                  Catálogo de Produtos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Explore nosso catálogo completo de produtos
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-6 animate-slide-up">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-md">
                <SearchInput
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Buscar produtos por nome..."
                />
              </div>
              <Badge variant="outline" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {produtos.length} produto(s)
              </Badge>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[0,1,2,3,4,5].map((i) => (
                  <ModernCard key={i} variant="glass">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-2/3" />
                    </div>
                  </ModernCard>
                ))}
              </div>
            ) : produtos.length === 0 ? (
              <ModernCard variant="glass" className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? 'Nenhum produto encontrado' : 'Catálogo vazio'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? 'Tente buscar com outros termos ou verifique a escrita'
                        : 'Ainda não há produtos cadastrados no sistema'
                      }
                    </p>
                  </div>
                </div>
              </ModernCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {produtos.map((produto) => (
                  <ModernCard key={produto.id} variant="glass" className="overflow-hidden hover-scale group">
                    {/* Product Image */}
                    <div className="relative h-48 bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden">
                      {produto.imagem_url ? (
                        <img
                          src={produto.imagem_url}
                          alt={produto.nome}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Ver
                        </Badge>
                      </div>
                    </div>

                    {/* Product Info */}
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">{produto.nome}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {produto.descricao || 'Produto sem descrição'}
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Preço:</span>
                          <span className="font-bold text-lg text-primary">
                            {formatCurrency(getPrecoParaUsuario(produto))}
                          </span>
                        </div>
                        
                        {/* Regional Pricing Details */}
                        <div className="space-y-1 pt-2 border-t border-border/40">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">SP:</span>
                            <span>{formatCurrency(produto.preco_sp || 0)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Sul/Sudeste:</span>
                            <span>{formatCurrency(produto.preco_sul_sudeste || 0)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Outros:</span>
                            <span>{formatCurrency(produto.preco_outros || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </ModernCard>
                ))}
              </div>
            )}

            {/* Bottom Summary */}
            {!loading && produtos.length > 0 && (
              <ModernCard variant="gradient" className="text-center">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {produtos.length} produto(s) 
                    {searchQuery && ` para "${searchQuery}"`}
                  </p>
                </CardContent>
              </ModernCard>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProdutosViewPage;