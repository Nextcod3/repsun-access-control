
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Package, 
  PlusCircle,
  Search,
  BarChart3,
  Calendar
} from 'lucide-react';
import { getOrcamentos } from '@/services/orcamentoService';
import { getClientes } from '@/services/clienteService';
import { toast } from '@/components/ui/use-toast';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrcamentos: 0,
    pendentes: 0,
    aprovados: 0,
    rejeitados: 0,
    totalClientes: 0
  });
  const [recentOrcamentos, setRecentOrcamentos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar orçamentos
        const orcamentos = await getOrcamentos();
        
        // Buscar clientes
        const clientes = await getClientes();
        
        // Calcular estatísticas
        const pendentes = orcamentos.filter(o => o.status === 'enviado').length;
        const aprovados = orcamentos.filter(o => o.status === 'aprovado').length;
        const rejeitados = orcamentos.filter(o => o.status === 'rejeitado').length;
        
        setStats({
          totalOrcamentos: orcamentos.length,
          pendentes,
          aprovados,
          rejeitados,
          totalClientes: clientes.length
        });
        
        // Obter orçamentos recentes
        setRecentOrcamentos(
          orcamentos
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
            .slice(0, 5)
        );
        
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do dashboard",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleNovoOrcamento = () => {
    navigate('/orcamentos/novo');
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'rascunho': return 'text-gray-500';
      case 'enviado': return 'text-blue-500';
      case 'aprovado': return 'text-green-500';
      case 'rejeitado': return 'text-red-500';
      case 'cancelado': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'rascunho': return <FileText className="h-4 w-4" />;
      case 'enviado': return <Clock className="h-4 w-4" />;
      case 'aprovado': return <CheckCircle className="h-4 w-4" />;
      case 'rejeitado': return <XCircle className="h-4 w-4" />;
      case 'cancelado': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">RepSUN</h1>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Gerencie seus orçamentos e propostas comerciais</p>
          </div>
          <Button 
            onClick={handleNovoOrcamento}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Novo Orçamento
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalOrcamentos}</div>
              <CardDescription>Orçamentos criados</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.pendentes}</div>
              <CardDescription>Aguardando resposta</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.aprovados}</div>
              <CardDescription>Orçamentos aprovados</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalClientes}</div>
              <CardDescription>Clientes cadastrados</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Tabs e Conteúdo */}
        <Tabs defaultValue="recentes" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="recentes">Orçamentos Recentes</TabsTrigger>
            <TabsTrigger value="acoes">Ações Rápidas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recentes">
            <Card>
              <CardHeader>
                <CardTitle>Orçamentos Recentes</CardTitle>
                <CardDescription>Seus últimos orçamentos criados</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Carregando...</div>
                ) : recentOrcamentos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Nº</th>
                          <th className="text-left py-3 px-2">Data</th>
                          <th className="text-left py-3 px-2">Cliente</th>
                          <th className="text-left py-3 px-2">Valor</th>
                          <th className="text-left py-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrcamentos.map((orcamento) => (
                          <tr key={orcamento.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">{orcamento.numero}</td>
                            <td className="py-3 px-2">{formatDate(orcamento.created_at)}</td>
                            <td className="py-3 px-2">Cliente {orcamento.cliente_id.substring(0, 8)}</td>
                            <td className="py-3 px-2">
                              {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              }).format(orcamento.valor_total || 0)}
                            </td>
                            <td className="py-3 px-2">
                              <div className={`flex items-center gap-1 ${getStatusColor(orcamento.status)}`}>
                                {getStatusIcon(orcamento.status)}
                                <span className="capitalize">{orcamento.status}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhum orçamento encontrado
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link to="/orcamentos">
                  <Button variant="outline">Ver Todos</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="acoes">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Clientes</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Link to="/clientes/novo">
                    <Button variant="outline" className="w-full justify-start">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Novo Cliente
                    </Button>
                  </Link>
                  <Link to="/clientes">
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar Clientes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Orçamentos</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Link to="/orcamentos/novo">
                    <Button variant="outline" className="w-full justify-start">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Novo Orçamento
                    </Button>
                  </Link>
                  <Link to="/orcamentos">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Listar Orçamentos
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Produtos</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Link to="/produtos">
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="mr-2 h-4 w-4" />
                      Catálogo de Produtos
                    </Button>
                  </Link>
                  <Link to="/produtos/busca">
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="mr-2 h-4 w-4" />
                      Buscar Produtos
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Calendário e Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Agenda</CardTitle>
                <Calendar className="h-5 w-5 text-gray-500" />
              </div>
              <CardDescription>Próximos compromissos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Funcionalidade em desenvolvimento
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Relatórios</CardTitle>
                <BarChart3 className="h-5 w-5 text-gray-500" />
              </div>
              <CardDescription>Resumo de desempenho</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Funcionalidade em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
