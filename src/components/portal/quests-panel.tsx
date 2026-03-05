'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { BentoCard } from './bento-card';
import { Spinner } from '@/components/ui/spinner';

interface Quest {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xpReward: number;
  difficulty: string;
  status: string;
  userProgress: string | null;
}

type Period = 'daily' | 'weekly' | 'monthly';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export function QuestsPanel() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('daily');

  const { data: quests, loading } = useApi<Quest[]>(
    user ? `/api/portal/quests?category=${period}` : '',
    { immediate: !!user },
  );

  return (
    <BentoCard title="Quests">
      {/* Period tabs */}
      <div className="mb-4 flex rounded-xl border border-zinc-200 p-0.5 dark:border-zinc-800">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              period === p.key
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Quest list */}
      {!user ? (
        <p className="py-4 text-center text-[10px] uppercase tracking-wider text-zinc-400">Sign in to view</p>
      ) : loading ? (
        <div className="flex justify-center py-6"><Spinner size="sm" /></div>
      ) : !quests?.length ? (
        <p className="py-4 text-center text-[10px] uppercase tracking-wider text-zinc-400">No {period} quests</p>
      ) : (
        <div className="space-y-2">
          {quests.slice(0, 5).map((q) => (
            <Link
              key={q.id}
              href={`/portal/quests/${q.id}`}
              className="block rounded-xl border border-zinc-200/60 p-3 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-zinc-900 line-clamp-1 dark:text-zinc-100">
                  {q.title}
                </h4>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {q.difficulty}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs font-bold text-[#FF394A]">+{q.xpReward} XP</span>
                {q.userProgress && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/60 dark:text-emerald-400/60">
                    {q.userProgress}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </BentoCard>
  );
}
