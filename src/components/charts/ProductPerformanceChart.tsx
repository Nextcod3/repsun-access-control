import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ProductData {
  name: string;
  vendas: number;
  orcamentos: number;
  conversao: number;
}

interface ProductPerformanceChartProps {
  data: ProductData[];
}

const chartConfig = {
  vendas: {
    label: 'Vendas',
    color: 'hsl(var(--primary))',
  },
  orcamentos: {
    label: 'Orçamentos',
    color: 'hsl(var(--secondary))',
  },
};

export function ProductPerformanceChart({ data }: ProductPerformanceChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-muted-foreground"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            className="text-muted-foreground"
            fontSize={12}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar 
            dataKey="orcamentos" 
            fill="hsl(var(--secondary))" 
            name="Orçamentos"
            radius={[0, 0, 4, 4]}
          />
          <Bar 
            dataKey="vendas" 
            fill="hsl(var(--primary))" 
            name="Vendas"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}