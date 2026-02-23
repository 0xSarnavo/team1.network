'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useApi } from '@/lib/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface LeaderboardUser {
  rank: number;
  id: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
}

const RANK_STYLES: Record<number, string> = {
  1: 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
  2: 'text-zinc-300 bg-zinc-700/30 border-zinc-600',
  3: 'text-orange-400 bg-orange-900/30 border-orange-700',
};

export default function MemberLeaderboardPage() {
  const [view, setView] = useState<'members' | 'public'>('members');

  const { data: memberBoard, loading: loadingMembers } = useApi<LeaderboardUser[]>('/api/leaderboard/members');
  const { data: publicBoard, loading: loadingPublic } = useApi<LeaderboardUser[]>('/api/leaderboard/public');

  const leaderboard = view === 'members' ? memberBoard : publicBoard;
  const loading = view === 'members' ? loadingMembers : loadingPublic;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/portal/dashboard" className="mb-3 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-zinc-100">Leaderboard</h1>
          <p className="mt-1 text-zinc-400">See who's leading the pack in the community.</p>
        </div>

        {/* View toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setView('members')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              view === 'members' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Members Only
          </button>
          <button
            onClick={() => setView('public')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              view === 'public' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            All Users
          </button>
        </div>

        {/* Top 3 podium */}
        {leaderboard && leaderboard.length >= 3 && (
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, idx) => {
              const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
              const isFirst = rank === 1;
              return (
                <div
                  key={user.id}
                  className={`flex flex-col items-center rounded-xl border bg-zinc-900/50 p-4 ${isFirst ? 'border-yellow-700/50 -mt-4 pb-6' : 'border-zinc-800 mt-2'}`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold mb-3 ${RANK_STYLES[rank]}`}>
                    {rank}
                  </div>
                  <Avatar src={user.avatarUrl} alt={user.displayName} size={isFirst ? 'lg' : 'md'} />
                  <p className={`mt-2 font-semibold text-zinc-100 text-center truncate w-full ${isFirst ? 'text-base' : 'text-sm'}`}>
                    {user.displayName}
                  </p>
                  {user.username && (
                    <p className="text-xs text-zinc-500 truncate w-full text-center">@{user.username}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-green-400">{user.totalXp.toLocaleString()} XP</span>
                    <Badge variant="default">Lv.{user.level}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        {loading ? (
          <PageLoader />
        ) : !leaderboard || leaderboard.length === 0 ? (
          <EmptyState
            title="No rankings yet"
            description={view === 'members' ? 'No members have earned XP yet.' : 'No users have earned XP yet.'}
          />
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-4 py-3 text-xs uppercase text-zinc-500 font-medium w-16">Rank</th>
                  <th className="px-4 py-3 text-xs uppercase text-zinc-500 font-medium">Builder</th>
                  <th className="px-4 py-3 text-xs uppercase text-zinc-500 font-medium text-right">Level</th>
                  <th className="px-4 py-3 text-xs uppercase text-zinc-500 font-medium text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {leaderboard.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        RANK_STYLES[user.rank] ? `border ${RANK_STYLES[user.rank]}` : 'text-zinc-500'
                      }`}>
                        {user.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={user.username ? `/profile/${user.username}` : '#'} className="flex items-center gap-3 hover:opacity-80">
                        <Avatar src={user.avatarUrl} alt={user.displayName} size="sm" />
                        <div>
                          <p className="font-medium text-zinc-200">{user.displayName}</p>
                          {user.username && <p className="text-xs text-zinc-500">@{user.username}</p>}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="default">Lv.{user.level}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-400">
                      {user.totalXp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
