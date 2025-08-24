import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ModernCard } from '@/components/ui/modern-card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'gradient' | 'glass';
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  variant = 'gradient',
  colorScheme = 'blue',
  loading = false
}: StatCardProps) {
  const getColorClasses = () => {
    switch (colorScheme) {
      case 'green':
        return {
          icon: 'text-success',
          bg: 'bg-success/10',
          trend: trend?.isPositive ? 'text-success' : 'text-destructive'
        };
      case 'purple':
        return {
          icon: 'text-accent-foreground',
          bg: 'bg-accent/50',
          trend: trend?.isPositive ? 'text-success' : 'text-destructive'
        };
      case 'orange':
        return {
          icon: 'text-warning',
          bg: 'bg-warning/10',
          trend: trend?.isPositive ? 'text-success' : 'text-destructive'
        };
      case 'red':
        return {
          icon: 'text-destructive',
          bg: 'bg-destructive/10',
          trend: trend?.isPositive ? 'text-success' : 'text-destructive'
        };
      default: // blue
        return {
          icon: 'text-primary',
          bg: 'bg-primary/10',
          trend: trend?.isPositive ? 'text-success' : 'text-destructive'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <ModernCard variant={variant} className="hover-scale animate-slide-up">
      {loading ? (
        <div>
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-40 mt-2" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg}`}>
              <Icon className={`h-4 w-4 ${colors.icon}`} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold transition-all duration-300">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p className={`text-xs ${colors.trend}`}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% desde o último mês
              </p>
            )}
          </div>
        </>
      )}
    </ModernCard>
  );
}