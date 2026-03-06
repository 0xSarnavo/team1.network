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
    <BentoCard 
      title="Quests"
      headerRight={
        <svg className="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      }
      className={!user ? "p-0 overflow-hidden" : ""}
    >
      {/* Period tabs */}
      <div className={`flex w-full mb-4 ${!user ? 'border-b border-zinc-200 dark:border-zinc-800/60 px-4 pt-4' : 'rounded-xl border border-zinc-200 p-0.5 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent'}`}>
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={!user 
              ? `flex-1 pb-3 text-[10px] font-bold tracking-wider transition-colors relative ${period === p.key ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400'}`
              : `flex-1 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${period === p.key ? 'bg-white text-zinc-900 shadow-sm dark:bg-white dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'}`
            }
          >
            {!user ? p.key.toUpperCase() : p.label}
            {!user && period === p.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900 dark:bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Quest list */}
      {!user ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="mb-4 text-[12px] text-zinc-500">Sign in to view and complete quests</p>
          <Link href="/auth/login" className="rounded-lg border border-zinc-200 bg-white px-6 py-2 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-transparent dark:text-white dark:hover:bg-zinc-900">
            Sign In
          </Link>
        </div>
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
              className="block rounded-xl border border-zinc-200 bg-white p-3 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:bg-transparent dark:hover:border-zinc-700"
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
