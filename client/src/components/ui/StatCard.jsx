import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = React.memo(({
  label,
  value,
  trend, // { value: number, isPositive: boolean }
  accent = false,
  className = ''
}) => {
  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4 shadow-sm ${accent ? 'border-l-2 border-l-brand-500' : ''} ${className}`}>
      <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
        {label}
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">
          {value}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {trend.value}%
          </div>
        )}
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';
