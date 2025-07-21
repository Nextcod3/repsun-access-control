import React from 'react';
import { ModernCard } from '@/components/ui/modern-card';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

interface ChartPlaceholderProps {
  title: string;
  description?: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  height?: number;
  data?: any[];
}

export function ChartPlaceholder({ 
  title, 
  description, 
  type, 
  height = 200 
}: ChartPlaceholderProps) {
  const getIcon = () => {
    switch (type) {
      case 'bar':
        return <BarChart3 className="h-8 w-8 text-muted-foreground" />;
      case 'line':
        return <TrendingUp className="h-8 w-8 text-muted-foreground" />;
      case 'pie':
        return <PieChart className="h-8 w-8 text-muted-foreground" />;
      case 'area':
        return <TrendingUp className="h-8 w-8 text-muted-foreground" />;
      default:
        return <BarChart3 className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getPattern = () => {
    switch (type) {
      case 'bar':
        return (
          <div className="flex items-end gap-2 h-24">
            {[40, 70, 45, 80, 60, 55, 90].map((height, i) => (
              <div
                key={i}
                className="bg-gradient-to-t from-primary/20 to-primary/10 rounded-t w-4 animate-pulse"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        );
      case 'line':
        return (
          <div className="relative h-24">
            <svg className="w-full h-full" viewBox="0 0 200 50">
              <path
                d="M10,40 Q50,10 90,20 T170,15"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                fill="none"
                className="animate-pulse opacity-60"
              />
              <path
                d="M10,40 Q50,10 90,20 T170,15 L170,50 L10,50 Z"
                fill="url(#gradient)"
                className="animate-pulse opacity-30"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );
      case 'pie':
        return (
          <div className="flex items-center justify-center h-24">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary-glow/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-green-500/20 to-cyan-500/20 animate-pulse" 
                   style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"
                   style={{ animationDelay: '1s' }} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ModernCard variant="glass" className="hover-scale">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          {getIcon()}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      <div className="mt-6" style={{ height }}>
        <div className="flex items-center justify-center h-full">
          {getPattern()}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Gráfico em desenvolvimento • Dados em tempo real em breve
        </p>
      </div>
    </ModernCard>
  );
}