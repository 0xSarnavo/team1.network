'use client';

import React from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { BentoCard } from './bento-card';
import { Avatar } from '@/components/ui/avatar';

// XP thresholds per level (simplified formula)
function xpForLevel(level: number): number {
  return level * 500;
}

export function PersonalCard() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <BentoCard>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </BentoCard>
    );
  }

  const currentLevelXp = xpForLevel(user.level);
  const nextLevelXp = xpForLevel(user.level + 1);
  const xpInLevel = user.totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progress = Math.min(Math.max((xpInLevel / xpNeeded) * 100, 0), 100);

  return (
    <BentoCard>
      <div className="flex flex-col items-center gap-3">
        <Avatar src={user.avatarUrl} alt={user.displayName} size="lg" />
        <div className="text-center">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {user.displayName}
          </h3>
          {user.username && (
            <p className="text-[10px] text-zinc-500">@{user.username}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="text-zinc-500">Level {user.level}</span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="text-[#FF394A]">{user.totalXp.toLocaleString()} XP</span>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full">
          <div className="mb-1 flex items-center justify-between text-[10px] text-zinc-400">
            <span>Lv.{user.level}</span>
            <span>Lv.{user.level + 1}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-[#FF394A] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-center text-[10px] text-zinc-400">
            {xpInLevel} / {xpNeeded} XP
          </p>
        </div>
      </div>
    </BentoCard>
  );
}
