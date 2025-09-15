import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/layout/UserSidebar';
import { ModernCard } from '@/components/ui/modern-card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { StatusDistributionChart } from '@/components/charts/StatusDistributionChart';
import { ProductPerformanceChart } from '@/components/charts/ProductPerformanceChart';
import { getAnalytics, type AnalyticsData } from '@/services/analyticsService';
import { useToast } from '@/hooks/useToast';
import { 
  TrendingUp, 
  FileText, 
  Target, 
  DollarSign, 
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  TrendingDown
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
      toast({
        title: 'Sucesso',
        description: 'Dados de analytics atualizados',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportReport = () => {
    if (!analytics) return;
    
    const reportData = {
      geradoEm: format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }),
      resumo: analytics.totalStats,
      receitaMensal: analytics.monthlyRevenue,
      distribuicaoStatus: analytics.statusDistribution,
      performanceProdutos: analytics.productPerformance,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Sucesso',
      description: 'Relatório exportado com sucesso',
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <UserSidebar />
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics & Relatórios</h1>
              <p className="text-muted-foreground mt-1">
                Análise detalhada do desempenho do seu negócio
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={fetchAnalytics}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                onClick={handleExportReport}
                disabled={loading || !analytics}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))
            ) : (
              analytics && (
                <>
                  <StatCard
                    title="Receita Total"
                    value={`R$ ${analytics.totalStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    description="Orçamentos aprovados"
                    icon={DollarSign}
                    colorScheme="green"
                    trend={{
                      value: analytics.totalStats.totalRevenue > 0 ? 12.5 : 0,
                      isPositive: true
                    }}
                  />
                  <StatCard
                    title="Total de Orçamentos"
                    value={analytics.totalStats.totalBudgets.toString()}
                    description="Todos os status"
                    icon={FileText}
                    colorScheme="blue"
                    trend={{
                      value: 8.2,
                      isPositive: true
                    }}
                  />
                  <StatCard
                    title="Taxa de Conversão"
                    value={`${analytics.totalStats.conversionRate.toFixed(1)}%`}
                    description="Aprovação de orçamentos"
                    icon={Target}
                    colorScheme="purple"
                    trend={{
                      value: analytics.totalStats.conversionRate,
                      isPositive: analytics.totalStats.conversionRate > 50
                    }}
                  />
                  <StatCard
                    title="Ticket Médio"
                    value={`R$ ${analytics.totalStats.averageValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    description="Valor médio por venda"
                    icon={TrendingUp}
                    colorScheme="orange"
                    trend={{
                      value: 5.4,
                      isPositive: true
                    }}
                  />
                </>
              )
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <ModernCard className="col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Receita Mensal</h3>
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                analytics && <RevenueChart data={analytics.monthlyRevenue} />
              )}
            </ModernCard>

            {/* Status Distribution */}
            <ModernCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Distribuição por Status</h3>
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                analytics && <StatusDistributionChart data={analytics.statusDistribution} />
              )}
            </ModernCard>

            {/* Product Performance */}
            <ModernCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Performance dos Produtos</h3>
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-[300px]" />
              ) : (
                analytics && <ProductPerformanceChart data={analytics.productPerformance} />
              )}
            </ModernCard>
          </div>

          {/* Insights */}
          <ModernCard>
            <h3 className="text-lg font-semibold mb-4">Insights e Recomendações</h3>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))
              ) : (
                analytics && (
                  <>
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                      <h4 className="font-medium text-success mb-1">📈 Desempenho Positivo</h4>
                      <p className="text-sm text-muted-foreground">
                        Sua taxa de conversão está em {analytics.totalStats.conversionRate.toFixed(1)}%. 
                        {analytics.totalStats.conversionRate > 50 
                          ? ' Excelente performance!' 
                          : ' Há espaço para melhorias no processo de vendas.'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <h4 className="font-medium text-primary mb-1">💡 Oportunidade</h4>
                      <p className="text-sm text-muted-foreground">
                        O ticket médio atual é de R$ {analytics.totalStats.averageValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. 
                        Considere estratégias de upselling para aumentar este valor.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <h4 className="font-medium text-warning mb-1">⚠️ Atenção</h4>
                      <p className="text-sm text-muted-foreground">
                        {analytics.statusDistribution.find(s => s.name === 'Enviado')?.value || 0} orçamentos 
                        estão pendentes. Faça o acompanhamento para melhorar a conversão.
                      </p>
                    </div>
                  </>
                )
              )}
            </div>
          </ModernCard>
        </main>
      </div>
    </SidebarProvider>
  );
}