import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Package, 
  FileText, 
  BarChart3, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { getUsuarios } from '@/services/usuarioService';
import { getProdutos } from '@/services/produtoService';
import { toast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/utils/format';

/**
 * Dashboard administrativo com indicadores e estatísticas
 */
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosPendentes: 0,
    totalProdutos: 0,
    // Dados fictícios para gráficos
    orcamentosRecentes: 12,
    orcamentosAprovados: 8,
    valorTotalOrcamentos: 15750.50
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários
      const usuariosData = await getUsuarios();
      
      // Buscar produtos
      const produtosData = await getProdutos();
      
      // Calcular estatísticas
      const usuariosPendentes = usuariosData.filter(u => !u.status && u.perfil === 'usuario').length;
      
      setStats({
        totalUsuarios: usuariosData.length,
        usuariosPendentes,
        totalProdutos: produtosData.length,
        // Dados fictícios para gráficos (em uma aplicação real, viriam do backend)
        orcamentosRecentes: 12,
        orcamentosAprovados: 8,
        valorTotalOrcamentos: 15750.50
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Componente para renderizar um gráfico de barras simples
  const SimpleBarChart = ({ data, maxValue, color }: { data: number[], maxValue: number, color: string }) => (
    <div className="flex items-end h-16 gap-1">
      {data.map((value, index) => (
        <div 
          key={index}
          className={`w-4 ${color} rounded-t`}
          style={{ height: `${(value / maxValue) * 100}%` }}
        />
      ))}
    </div>
  );

  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Visão geral do sistema"
    >
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
                <CardDescription>Total de usuários cadastrados</CardDescription>
                {stats.usuariosPendentes > 0 && (
                  <div className="mt-2 flex items-center text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {stats.usuariosPendentes} usuário(s) pendente(s)
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                <Package className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProdutos}</div>
                <CardDescription>Produtos cadastrados</CardDescription>
                <div className="mt-2 flex items-center text-xs text-blue-600">
                  <Link to="/admin/produtos" className="flex items-center hover:underline">
                    Ver produtos
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orçamentos Recentes</CardTitle>
                <FileText className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orcamentosRecentes}</div>
                <CardDescription>Nos últimos 30 dias</CardDescription>
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {stats.orcamentosAprovados} aprovados
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.valorTotalOrcamentos)}</div>
                <CardDescription>Em orçamentos aprovados</CardDescription>
                <div className="mt-2 flex items-center text-xs text-blue-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Últimos 30 dias
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos e indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Orçamentos por Período</CardTitle>
                <CardDescription>Últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={[5, 8, 12, 7, 10, 9, 12]} 
                  maxValue={15}
                  color="bg-blue-500"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Seg</span>
                  <span>Ter</span>
                  <span>Qua</span>
                  <span>Qui</span>
                  <span>Sex</span>
                  <span>Sáb</span>
                  <span>Dom</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuários Pendentes</CardTitle>
                <CardDescription>Aguardando aprovação</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.usuariosPendentes > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                        <span>{stats.usuariosPendentes} usuário(s) aguardando aprovação</span>
                      </div>
                      <Link to="/admin/usuarios">
                        <Button size="sm">Gerenciar</Button>
                      </Link>
                    </div>
                    <p className="text-sm text-gray-500">
                      Novos usuários precisam ser aprovados para acessar o sistema.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <p className="text-gray-500">Nenhum usuário pendente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/usuarios">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar Usuários
                  </Button>
                </Link>
                <Link to="/admin/produtos">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Gerenciar Produtos
                  </Button>
                </Link>
                <Link to="/admin/configuracoes">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver Relatórios
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;