import React from 'react';
import { Card } from './card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  className?: string;
}

export function StatCard({ label, value, icon, change, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
          {change && <p className="mt-1 text-xs text-green-500 dark:text-green-400">{change}</p>}
        </div>
        {icon && <div className="text-zinc-400 dark:text-zinc-500">{icon}</div>}
      </div>
    </Card>
  );
}
