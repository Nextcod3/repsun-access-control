
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  LogOut, 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Upload
} from 'lucide-react';
import { getUsuarios, aprovarUsuario, desativarUsuario } from '@/services/usuarioService';
import { getProdutos } from '@/services/produtoService';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [usuarioSearchTerm, setUsuarioSearchTerm] = useState('');
  const [produtoSearchTerm, setProdutoSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosPendentes: 0,
    totalProdutos: 0
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'aprovar' | 'desativar' | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usuariosData = await getUsuarios();
      setUsuarios(usuariosData);
      
      // Fetch products
      const produtosData = await getProdutos();
      setProdutos(produtosData);
      
      // Calculate stats
      const usuariosPendentes = usuariosData.filter(u => !u.status && u.perfil === 'usuario').length;
      
      setStats({
        totalUsuarios: usuariosData.length,
        usuariosPendentes,
        totalProdutos: produtosData.length
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUsuarioSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsuarioSearchTerm(e.target.value);
  };

  const handleProdutoSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProdutoSearchTerm(e.target.value);
  };

  const filteredUsuarios = usuarios.filter(usuario => 
    usuario.nome.toLowerCase().includes(usuarioSearchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(usuarioSearchTerm.toLowerCase())
  );

  const filteredProdutos = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(produtoSearchTerm.toLowerCase())
  );

  const handleAprovarUsuario = (usuario: any) => {
    setSelectedUsuario(usuario);
    setDialogType('aprovar');
    setDialogOpen(true);
  };

  const handleDesativarUsuario = (usuario: any) => {
    setSelectedUsuario(usuario);
    setDialogType('desativar');
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUsuario || !dialogType) return;
    
    try {
      setProcessing(true);
      
      if (dialogType === 'aprovar') {
        await aprovarUsuario(selectedUsuario.id);
        
        // Update local state
        setUsuarios(usuarios.map(u => 
          u.id === selectedUsuario.id ? { ...u, status: true } : u
        ));
        
        toast({
          title: "Sucesso",
          description: "Usuário aprovado com sucesso"
        });
      } else if (dialogType === 'desativar') {
        await desativarUsuario(selectedUsuario.id);
        
        // Update local state
        setUsuarios(usuarios.map(u => 
          u.id === selectedUsuario.id ? { ...u, status: false } : u
        ));
        
        toast({
          title: "Sucesso",
          description: "Usuário desativado com sucesso"
        });
      }
      
      // Recalculate stats
      const usuariosPendentes = usuarios
        .map(u => u.id === selectedUsuario.id ? { ...u, status: dialogType === 'aprovar' } : u)
        .filter(u => !u.status && u.perfil === 'usuario')
        .length;
      
      setStats({
        ...stats,
        usuariosPendentes
      });
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao processar ação:', error);
      toast({
        title: "Erro",
        description: `Não foi possível ${dialogType === 'aprovar' ? 'aprovar' : 'desativar'} o usuário`,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">RepSUN - Admin</h1>
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Painel Administrativo</h2>
          <p className="text-gray-600">Gerencie usuários e configurações do sistema</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsuarios}</div>
              <CardDescription>Usuários cadastrados</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.usuariosPendentes}</div>
              <CardDescription>Usuários aguardando aprovação</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalProdutos}</div>
              <CardDescription>Produtos cadastrados</CardDescription>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="usuarios" className="mb-6">
          <TabsList>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="usuarios">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gerenciar Usuários</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar usuários..."
                    className="pl-8"
                    value={usuarioSearchTerm}
                    onChange={handleUsuarioSearch}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredUsuarios.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Perfil</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data de Cadastro</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsuarios.map((usuario) => (
                          <TableRow key={usuario.id}>
                            <TableCell className="font-medium">{usuario.nome}</TableCell>
                            <TableCell>{usuario.email}</TableCell>
                            <TableCell>
                              <Badge variant={usuario.perfil === 'admin' ? 'default' : 'outline'}>
                                {usuario.perfil === 'admin' ? 'Administrador' : 'Usuário'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {usuario.status ? (
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(usuario.created_at)}</TableCell>
                            <TableCell className="text-right">
                              {usuario.perfil !== 'admin' && (
                                <div className="flex justify-end gap-2">
                                  {!usuario.status ? (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleAprovarUsuario(usuario)}
                                      className="text-green-600 border-green-200 hover:bg-green-50"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Aprovar
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleDesativarUsuario(usuario)}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Desativar
                                    </Button>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum usuário encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="produtos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gerenciar Produtos</CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Buscar produtos..."
                      className="pl-8"
                      value={produtoSearchTerm}
                      onChange={handleProdutoSearch}
                    />
                  </div>
                  <Link to="/admin/produtos/novo">
                    <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Produto
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredProdutos.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Preço SP</TableHead>
                          <TableHead>Preço Sul/Sudeste</TableHead>
                          <TableHead>Preço Outros</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProdutos.map((produto) => (
                          <TableRow key={produto.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {produto.imagem_url ? (
                                  <img 
                                    src={produto.imagem_url} 
                                    alt={produto.nome} 
                                    className="h-10 w-10 rounded-md object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{produto.nome}</p>
                                  <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                    {produto.descricao}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(produto.preco_sp)}</TableCell>
                            <TableCell>{formatCurrency(produto.preco_sul_sudeste)}</TableCell>
                            <TableCell>{formatCurrency(produto.preco_outros)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/admin/produtos/editar/${produto.id}`}>
                                  <Button variant="outline" size="sm">
                                    Editar
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {produtoSearchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                    <div className="mt-4">
                      <Link to="/admin/produtos/novo">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Cadastrar Produto
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link to="/admin/produtos/importar">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Importar Produtos
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'aprovar' ? 'Aprovar Usuário' : 'Desativar Usuário'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'aprovar' 
                ? `Tem certeza que deseja aprovar o usuário ${selectedUsuario?.nome}?`
                : `Tem certeza que deseja desativar o usuário ${selectedUsuario?.nome}?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={processing}
              variant={dialogType === 'aprovar' ? 'default' : 'destructive'}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                dialogType === 'aprovar' ? 'Aprovar' : 'Desativar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
