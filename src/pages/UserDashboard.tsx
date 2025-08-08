import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { StatCard } from '@/components/ui/stat-card';
import { ChartPlaceholder } from '@/components/ui/chart-placeholder';
import { ModernCard } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Users, 
  Package, 
  PlusCircle,
  TrendingUp,
  Calendar,
  BarChart3,
  ArrowRight,
  XCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { getOrcamentos } from '@/services/orcamentoService';
import { getClientes } from '@/services/clienteService';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format';
import { Skeleton } from '@/components/ui/skeleton';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrcamentos: 0,
    pendentes: 0,
    aprovados: 0,
    rejeitados: 0,
    totalClientes: 0,
    valorTotal: 0
  });
  const [recentOrcamentos, setRecentOrcamentos] = useState<any[]>([]);

  const fetchData = async (showToast = false) => {
    try {
      setLoading(true);
      
      const orcamentos = await getOrcamentos();
      const clientes = await getClientes();
      
      const pendentes = orcamentos.filter(o => o.status === 'enviado').length;
      const aprovados = orcamentos.filter(o => o.status === 'aprovado').length;
      const rejeitados = orcamentos.filter(o => o.status === 'rejeitado').length;
      const valorTotal = orcamentos
        .filter(o => o.status === 'aprovado')
        .reduce((sum, o) => sum + (o.valor_total || 0), 0);
      
      setStats({
        totalOrcamentos: orcamentos.length,
        pendentes,
        aprovados,
        rejeitados,
        totalClientes: clientes.length,
        valorTotal
      });
      
      setRecentOrcamentos(
        orcamentos
          .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
          .slice(0, 5)
      );

      if (showToast) {
        toast({ title: 'Atualizado', description: 'Dados do dashboard foram atualizados.' });
      }
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

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case 'aprovado': return 'default';
      case 'enviado': return 'secondary';
      case 'rejeitado': return 'destructive';
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo de volta, {user?.nome}
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
                <Button asChild className="bg-gradient-to-r from-green-500 to-cyan-500 hover:opacity-90">
                  <Link to="/orcamentos/novo" className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Novo Orçamento
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total de Orçamentos"
                value={loading ? '...' : stats.totalOrcamentos}
                description="Orçamentos criados"
                icon={FileText}
                colorScheme="blue"
                trend={{ value: 5, isPositive: true }}
              />
              
              <StatCard
                title="Pendentes"
                value={loading ? '...' : stats.pendentes}
                description="Aguardando resposta"
                icon={Clock}
                colorScheme="orange"
                trend={{ value: 2, isPositive: false }}
              />
              
              <StatCard
                title="Aprovados"
                value={loading ? '...' : stats.aprovados}
                description="Orçamentos aprovados"
                icon={CheckCircle}
                colorScheme="green"
                trend={{ value: 18, isPositive: true }}
              />
              
              <StatCard
                title="Clientes"
                value={loading ? '...' : stats.totalClientes}
                description="Clientes cadastrados"
                icon={Users}
                colorScheme="purple"
                trend={{ value: 12, isPositive: true }}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartPlaceholder
                title="Orçamentos por Status"
                description="Distribuição dos status dos orçamentos"
                type="pie"
              />
              
              <ChartPlaceholder
                title="Evolução Mensal"
                description="Crescimento de orçamentos ao longo do tempo"
                type="line"
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Quotes */}
              <div className="lg:col-span-2">
                <ModernCard variant="glass" className="h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Orçamentos Recentes</h3>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/orcamentos">
                        Ver Todos
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">Carregando...</div>
                  ) : recentOrcamentos.length > 0 ? (
                    <div className="space-y-3">
                      {recentOrcamentos.map((orcamento) => (
                        <div 
                          key={orcamento.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">#{orcamento.numero}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(orcamento.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-medium">
                                {formatCurrency(orcamento.valor_total || 0)}
                              </p>
                            </div>
                            <Badge variant={getStatusVariant(orcamento.status)} className="flex items-center gap-1">
                              {getStatusIcon(orcamento.status)}
                              {orcamento.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum orçamento encontrado
                    </div>
                  )}
                </ModernCard>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <ModernCard variant="gradient" className="hover-scale">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Valor Total</h4>
                        <p className="text-sm text-muted-foreground">Orçamentos aprovados</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</p>
                    <p className="text-xs text-muted-foreground">
                      +23% em relação ao mês anterior
                    </p>
                  </div>
                </ModernCard>

                <ModernCard variant="default">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Agenda
                    </h4>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Hoje • 14:00
                      </div>
                      <p className="text-sm">Reunião com cliente XYZ</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Amanhã • 10:00
                      </div>
                      <p className="text-sm">Apresentação de proposta</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Agenda
                    </Button>
                  </div>
                </ModernCard>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ModernCard className="hover-scale">
                <div className="text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 mx-auto">
                    <PlusCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="font-semibold">Novo Cliente</h4>
                  <p className="text-sm text-muted-foreground">
                    Cadastre um novo cliente no sistema
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/clientes/novo">Cadastrar Cliente</Link>
                  </Button>
                </div>
              </ModernCard>

              <ModernCard className="hover-scale">
                <div className="text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 mx-auto">
                    <Package className="h-6 w-6 text-green-500" />
                  </div>
                  <h4 className="font-semibold">Catálogo</h4>
                  <p className="text-sm text-muted-foreground">
                    Explore nosso catálogo de produtos
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/produtos">Ver Produtos</Link>
                  </Button>
                </div>
              </ModernCard>

              <ModernCard className="hover-scale">
                <div className="text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 mx-auto">
                    <BarChart3 className="h-6 w-6 text-purple-500" />
                  </div>
                  <h4 className="font-semibold">Relatórios</h4>
                  <p className="text-sm text-muted-foreground">
                    Analise suas métricas de vendas
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/relatorios">Ver Relatórios</Link>
                  </Button>
                </div>
              </ModernCard>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;