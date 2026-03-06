'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { BentoCard } from './bento-card';
import { Avatar } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';

interface LeaderboardUser {
  rank: number;
  id: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
}

const RANK_ACCENT: Record<number, string> = {
  1: 'text-[#FF394A] font-black',
  2: 'text-zinc-500 font-bold',
  3: 'text-zinc-400 font-bold',
};

export function LeaderboardPanel() {
  const { user } = useAuth();
  const { data: leaderboard, loading } = useApi<LeaderboardUser[]>(
    user ? '/api/leaderboard/members?limit=5' : '',
    { immediate: !!user },
  );

  return (
    <BentoCard 
      title="Leaderboard"
      headerRight={
        <svg className="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      }
      className={!user ? "p-0 overflow-hidden" : ""}
    >
      {!user ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="mb-4 text-[12px] text-zinc-500">Sign in to view rankings</p>
          <Link href="/auth/login" className="rounded-lg border border-zinc-200 bg-white px-6 py-2 text-[13px] font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-transparent dark:text-white dark:hover:bg-zinc-900">
            Sign In
          </Link>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-6"><Spinner size="sm" /></div>
      ) : !leaderboard?.length ? (
        <p className="py-4 text-center text-[10px] uppercase tracking-wider text-zinc-400">No rankings yet</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((u) => (
            <div key={u.id} className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800/60 dark:bg-transparent">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs ${RANK_ACCENT[u.rank] || 'text-zinc-400'}`}>
                {u.rank}
              </span>
              <Avatar src={u.avatarUrl} alt={u.displayName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 truncate dark:text-zinc-100">
                  {u.displayName}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-bold text-[#FF394A]">{u.totalXp.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-400">Lv.{u.level}</p>
              </div>
            </div>
          ))}

          <Link
            href="/portal/leaderboard"
            className="mt-2 block text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            View All →
          </Link>
        </div>
      )}
    </BentoCard>
  );
}
