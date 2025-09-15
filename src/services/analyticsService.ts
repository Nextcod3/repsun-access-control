import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface MonthlyRevenue {
  month: string;
  approved: number;
  pending: number;
  rejected: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ProductPerformance {
  name: string;
  vendas: number;
  orcamentos: number;
  conversao: number;
}

export interface AnalyticsData {
  monthlyRevenue: MonthlyRevenue[];
  statusDistribution: StatusDistribution[];
  productPerformance: ProductPerformance[];
  totalStats: {
    totalRevenue: number;
    totalBudgets: number;
    conversionRate: number;
    averageValue: number;
  };
}

export const getAnalytics = async (): Promise<AnalyticsData> => {
  try {
    // Get data for the last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      months.push(subMonths(new Date(), i));
    }

    // Monthly revenue data
    const monthlyRevenuePromises = months.map(async (month) => {
      const startDate = startOfMonth(month);
      const endDate = endOfMonth(month);

      const { data: approved } = await supabase
        .from('orcamentos')
        .select('valor_total')
        .eq('status', 'aprovado')
        .gte('data_aprovacao', startDate.toISOString())
        .lte('data_aprovacao', endDate.toISOString());

      const { data: pending } = await supabase
        .from('orcamentos')
        .select('valor_total')
        .eq('status', 'enviado')
        .gte('data_envio', startDate.toISOString())
        .lte('data_envio', endDate.toISOString());

      const { data: rejected } = await supabase
        .from('orcamentos')
        .select('valor_total')
        .eq('status', 'rejeitado')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      return {
        month: format(month, 'MMM', { locale: ptBR }),
        approved: approved?.reduce((sum, item) => sum + Number(item.valor_total || 0), 0) || 0,
        pending: pending?.reduce((sum, item) => sum + Number(item.valor_total || 0), 0) || 0,
        rejected: rejected?.reduce((sum, item) => sum + Number(item.valor_total || 0), 0) || 0,
      };
    });

    const monthlyRevenue = await Promise.all(monthlyRevenuePromises);

    // Status distribution
    const { data: statusData } = await supabase
      .from('orcamentos')
      .select('status');

    const statusCounts = statusData?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const statusDistribution: StatusDistribution[] = [
      { name: 'Rascunho', value: statusCounts.rascunho || 0, color: 'hsl(var(--muted))' },
      { name: 'Enviado', value: statusCounts.enviado || 0, color: 'hsl(var(--primary))' },
      { name: 'Aprovado', value: statusCounts.aprovado || 0, color: 'hsl(var(--success))' },
      { name: 'Rejeitado', value: statusCounts.rejeitado || 0, color: 'hsl(var(--destructive))' },
    ];

    // Product performance
    const { data: productData } = await supabase
      .from('itens_orcamento')
      .select(`
        quantidade,
        produtos (nome),
        orcamentos (status)
      `);

    const productStats = productData?.reduce((acc, item) => {
      const productName = item.produtos?.nome || 'Produto desconhecido';
      const isApproved = item.orcamentos?.status === 'aprovado';
      
      if (!acc[productName]) {
        acc[productName] = { orcamentos: 0, vendas: 0 };
      }
      
      acc[productName].orcamentos += item.quantidade;
      if (isApproved) {
        acc[productName].vendas += item.quantidade;
      }
      
      return acc;
    }, {} as Record<string, { orcamentos: number; vendas: number }>) || {};

    const productPerformance: ProductPerformance[] = Object.entries(productStats)
      .map(([name, stats]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        vendas: stats.vendas,
        orcamentos: stats.orcamentos,
        conversao: stats.orcamentos > 0 ? (stats.vendas / stats.orcamentos) * 100 : 0,
      }))
      .sort((a, b) => b.orcamentos - a.orcamentos)
      .slice(0, 10);

    // Total stats
    const { data: allBudgets } = await supabase
      .from('orcamentos')
      .select('valor_total, status');

    const totalRevenue = allBudgets?.reduce((sum, item) => {
      return item.status === 'aprovado' ? sum + Number(item.valor_total || 0) : sum;
    }, 0) || 0;

    const totalBudgets = allBudgets?.length || 0;
    const approvedBudgets = allBudgets?.filter(item => item.status === 'aprovado').length || 0;
    const conversionRate = totalBudgets > 0 ? (approvedBudgets / totalBudgets) * 100 : 0;
    const averageValue = approvedBudgets > 0 ? totalRevenue / approvedBudgets : 0;

    return {
      monthlyRevenue,
      statusDistribution,
      productPerformance,
      totalStats: {
        totalRevenue,
        totalBudgets,
        conversionRate,
        averageValue,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar dados de analytics:', error);
    throw error;
  }
};