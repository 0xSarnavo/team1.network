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
    <BentoCard title="Leaderboard">
      {!user ? (
        <p className="py-4 text-center text-[10px] uppercase tracking-wider text-zinc-400">Sign in to view</p>
      ) : loading ? (
        <div className="flex justify-center py-6"><Spinner size="sm" /></div>
      ) : !leaderboard?.length ? (
        <p className="py-4 text-center text-[10px] uppercase tracking-wider text-zinc-400">No rankings yet</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((u) => (
            <div key={u.id} className="flex items-center gap-2.5 rounded-xl border border-zinc-200/60 px-3 py-2.5 dark:border-zinc-800/60">
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
