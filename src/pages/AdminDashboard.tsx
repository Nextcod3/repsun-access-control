import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { StatCard } from '@/components/ui/stat-card';
import { ChartPlaceholder } from '@/components/ui/chart-placeholder';
import { ModernCard } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Plus,
  Settings,
  RefreshCw
} from 'lucide-react';
import { getUsuarios } from '@/services/usuarioService';
import { getProdutos } from '@/services/produtoService';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosPendentes: 0,
    totalProdutos: 0,
    orcamentosRecentes: 12,
    orcamentosAprovados: 8,
    valorTotalOrcamentos: 15750.50
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showToast = false) => {
    try {
      setLoading(true);
      
      const usuariosData = await getUsuarios();
      const produtosData = await getProdutos();
      
      const usuariosPendentes = usuariosData.filter(u => !u.status && u.perfil === 'usuario').length;
      
      setStats({
        totalUsuarios: usuariosData.length,
        usuariosPendentes,
        totalProdutos: produtosData.length,
        orcamentosRecentes: 12,
        orcamentosAprovados: 8,
        valorTotalOrcamentos: 15750.50
      });

      if (showToast) {
        toast({
          title: "Atualizado",
          description: "Dados do dashboard foram atualizados."
        });
      }
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-background/80">
        <AdminSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Dashboard Administrativo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visão geral e controle do sistema RepSUN
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => fetchData(true)}
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
                <Button asChild className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                  <Link to="/admin/usuarios" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Usuário
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-8 animate-enter">
            {loading ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[0,1,2,3].map((i) => (
                    <ModernCard key={i} variant="gradient" className="animate-enter">
                      <Skeleton className="h-4 w-24 mb-3" />
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-3 w-40 mt-2" />
                    </ModernCard>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <ModernCard variant="glass">
                    <Skeleton className="h-48 w-full" />
                  </ModernCard>
                  <ModernCard variant="glass">
                    <Skeleton className="h-48 w-full" />
                  </ModernCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {[0,1,2].map((i) => (
                    <ModernCard key={i} variant="default">
                      <Skeleton className="h-24 w-full" />
                    </ModernCard>
                  ))}
                </div>

                <ModernCard variant="glass" className="mt-6">
                  <Skeleton className="h-72 w-full" />
                </ModernCard>
              </>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total de Usuários"
                    value={stats.totalUsuarios}
                    description="Usuários cadastrados"
                    icon={Users}
                    colorScheme="blue"
                    trend={{ value: 12, isPositive: true }}
                  />
                  
                  <StatCard
                    title="Produtos"
                    value={stats.totalProdutos}
                    description="Produtos cadastrados"
                    icon={Package}
                    colorScheme="green"
                    trend={{ value: 8, isPositive: true }}
                  />
                  
                  <StatCard
                    title="Orçamentos Recentes"
                    value={stats.orcamentosRecentes}
                    description="Últimos 30 dias"
                    icon={FileText}
                    colorScheme="purple"
                    trend={{ value: 15, isPositive: true }}
                  />
                  
                  <StatCard
                    title="Valor Total"
                    value={formatCurrency(stats.valorTotalOrcamentos)}
                    description="Orçamentos aprovados"
                    icon={TrendingUp}
                    colorScheme="orange"
                    trend={{ value: 23, isPositive: true }}
                  />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartPlaceholder
                    title="Orçamentos por Período"
                    description="Evolução mensal dos orçamentos"
                    type="bar"
                  />
                  
                  <ChartPlaceholder
                    title="Taxa de Conversão"
                    description="Orçamentos aprovados vs rejeitados"
                    type="pie"
                  />
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Usuários Pendentes */}
                  <ModernCard variant="glass" className="hover-scale">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Usuários Pendentes</h3>
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      </div>
                      
                      {stats.usuariosPendentes > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                              <Clock className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="font-medium">{stats.usuariosPendentes} usuário(s)</p>
                              <p className="text-sm text-muted-foreground">Aguardando aprovação</p>
                            </div>
                          </div>
                          <Button asChild className="w-full">
                            <Link to="/admin/usuarios">
                              Gerenciar Usuários
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                          <p className="text-muted-foreground">Nenhum usuário pendente</p>
                        </div>
                      )}
                    </div>
                  </ModernCard>

                  {/* Produtos Recentes */}
                  <ModernCard variant="gradient" className="hover-scale">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Gestão de Produtos</h3>
                        <Package className="h-5 w-5 text-green-500" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Total de produtos</span>
                          <span className="font-medium">{stats.totalProdutos}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Ativos</span>
                          <span className="font-medium text-green-600">{stats.totalProdutos}</span>
                        </div>
                      </div>
                      
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/admin/produtos">
                          Ver Produtos
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </ModernCard>

                  {/* Sistema */}
                  <ModernCard variant="default" className="hover-scale">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Sistema</h3>
                        <Settings className="h-5 w-5 text-blue-500" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Sistema online</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Backup atualizado</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                          <span className="text-sm">2 atualizações pendentes</span>
                        </div>
                      </div>
                      
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/admin/configuracoes">
                          Configurações
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </ModernCard>
                </div>

                {/* Bottom Chart */}
                <ChartPlaceholder
                  title="Análise de Performance"
                  description="Métricas detalhadas de uso do sistema"
                  type="line"
                  height={300}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;