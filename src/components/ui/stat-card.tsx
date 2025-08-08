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
          icon: 'text-green-600',
          bg: 'bg-green-500/10',
          trend: trend?.isPositive ? 'text-green-600' : 'text-red-500'
        };
      case 'purple':
        return {
          icon: 'text-purple-600',
          bg: 'bg-purple-500/10',
          trend: trend?.isPositive ? 'text-green-600' : 'text-red-500'
        };
      case 'orange':
        return {
          icon: 'text-orange-600',
          bg: 'bg-orange-500/10',
          trend: trend?.isPositive ? 'text-green-600' : 'text-red-500'
        };
      case 'red':
        return {
          icon: 'text-red-600',
          bg: 'bg-red-500/10',
          trend: trend?.isPositive ? 'text-green-600' : 'text-red-500'
        };
      default: // blue
        return {
          icon: 'text-blue-600',
          bg: 'bg-blue-500/10',
          trend: trend?.isPositive ? 'text-green-600' : 'text-red-500'
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