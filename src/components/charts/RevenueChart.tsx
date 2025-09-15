import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface RevenueData {
  month: string;
  approved: number;
  pending: number;
  rejected: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const chartConfig = {
  approved: {
    label: 'Aprovados',
    color: 'hsl(var(--primary))',
  },
  pending: {
    label: 'Pendentes', 
    color: 'hsl(var(--warning))',
  },
  rejected: {
    label: 'Rejeitados',
    color: 'hsl(var(--destructive))',
  },
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="approved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="pending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="rejected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            className="text-muted-foreground"
            fontSize={12}
          />
          <YAxis 
            className="text-muted-foreground"
            fontSize={12}
            tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="approved"
            stackId="1"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#approved)"
            name="Aprovados"
          />
          <Area
            type="monotone"
            dataKey="pending"
            stackId="1"
            stroke="hsl(var(--warning))"
            fillOpacity={1}
            fill="url(#pending)"
            name="Pendentes"
          />
          <Area
            type="monotone"
            dataKey="rejected"
            stackId="1"
            stroke="hsl(var(--destructive))"
            fillOpacity={1}
            fill="url(#rejected)"
            name="Rejeitados"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}