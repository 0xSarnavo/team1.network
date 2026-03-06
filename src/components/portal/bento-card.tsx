'use client';

import React from 'react';

interface BentoCardProps {
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function BentoCard({ title, headerRight, children, className = '', id }: BentoCardProps) {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-zinc-200 bg-transparent p-5 dark:border-zinc-800/60 ${className}`}
    >
      {(title || headerRight) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{title}</h2>
          )}
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
