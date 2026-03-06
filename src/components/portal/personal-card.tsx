'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { BentoCard } from './bento-card';
import { Avatar } from '@/components/ui/avatar';

// XP thresholds per level (simplified formula)
function xpForLevel(level: number): number {
  return level * 500;
}

export function PersonalCard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <BentoCard>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </BentoCard>
    );
  }

  if (!user) {
    return (
      <BentoCard className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="mb-1 text-base font-bold text-zinc-900 dark:text-white">Not signed in</h3>
        <p className="mb-6 text-[13px] text-zinc-500 max-w-[200px]">Sign in to view your profile and track progress.</p>
        <Link href="/auth/login" className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-transparent dark:text-white dark:hover:bg-zinc-900">
          Sign In &rarr;
        </Link>
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
