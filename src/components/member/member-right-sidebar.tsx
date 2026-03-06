'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Star } from 'lucide-react';
import { useApi } from '@/lib/hooks/use-api';
import { useAuth } from '@/lib/context/auth-context';

interface LeaderboardUser {
  id: string;
  displayName: string;
  totalXp: number;
  level: number;
}

interface MemberRightSidebarProps {
  user: {
    displayName: string;
    avatarUrl?: string | null;
    totalXp: number;
    level: number;
    username?: string | null;
  };
}

export function MemberRightSidebar({ user }: MemberRightSidebarProps) {
  const { user: authUser } = useAuth();
  const [questTab, setQuestTab] = React.useState('MEMBER');
  const QUEST_TABS = ['MEMBER', 'DAILY', 'WEEKLY', 'MONTHLY'];

  const { data: leaderboard } = useApi<LeaderboardUser[]>(
    authUser ? '/api/leaderboard/members?limit=3' : '',
    { immediate: !!authUser },
  );

  const initials = user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const xpForNext = 500;
  const xpProgress = Math.min(((user.totalXp % xpForNext) / xpForNext) * 100, 100);

  return (
    <aside
      className="hidden lg:block shrink-0 overflow-y-auto"
      style={{
        width: 248,
        position: 'sticky',
        top: 64,
        height: 'calc(100vh - 64px)',
        padding: '16px 12px',
      }}
    >
      <div className="flex flex-col gap-4">

        {/* ── Profile Card ──────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center m-fu">
          <div className="relative mb-3">
            <div
              className="m-pulse flex items-center justify-center rounded-full"
              style={{
                width: 50,
                height: 50,
                background: 'var(--m-red)',
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: 15,
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {initials}
            </div>
            <div
              className="absolute flex items-center justify-center rounded-full"
              style={{
                width: 15,
                height: 15,
                bottom: 0,
                right: 0,
                background: 'var(--m-s3)',
                border: '1px solid var(--m-border)',
              }}
            >
              <Star style={{ width: 8, height: 8, color: 'var(--m-sub)' }} />
            </div>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--m-text)',
            }}
          >
            {user.displayName}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 11,
              color: 'var(--m-sub)',
            }}
          >
            @{user.username || 'user'}
          </p>
        </div>

        {/* ── XP Bar ──────────────────────────────────────────── */}
        <div
          className="m-fu1 rounded-[10px]"
          style={{
            background: 'var(--m-s1)',
            border: '1px solid var(--m-border)',
            padding: 10,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--m-sub)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Level {user.level}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--m-sub)',
              }}
            >
              {xpForNext} XP to next
            </span>
          </div>

          <div className="flex items-center justify-between mb-1">
            <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 9, color: 'var(--m-dim)' }}>
              Lv.{user.level}
            </span>
            <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 9, color: 'var(--m-dim)' }}>
              Lv.{user.level + 1}
            </span>
          </div>

          <div style={{ height: 3, background: 'var(--m-s3)', borderRadius: 2, overflow: 'hidden' }}>
            <div
              className="m-bar"
              style={{
                height: '100%',
                background: 'var(--m-dim)',
                borderRadius: 2,
                '--fill': `${xpProgress}%`,
              } as React.CSSProperties}
            />
          </div>

          <p
            className="text-center mt-2"
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 9,
              color: 'var(--m-dim)',
            }}
          >
            {user.totalXp % xpForNext} / {xpForNext} XP
          </p>
        </div>

        {/* ── Divider ──────────────────────────────────────────── */}
        <div style={{ height: 1, background: 'var(--m-border)' }} />

        {/* ── Quests ───────────────────────────────────────────── */}
        <div className="m-fu2">
          <p
            className="mb-3 uppercase"
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'var(--m-dim)',
            }}
          >
            Quests
          </p>

          <div
            className="flex rounded-[7px] p-[2px] mb-4 overflow-x-auto"
            style={{
              background: 'var(--m-s2)',
              border: '1px solid var(--m-border)',
            }}
          >
            {QUEST_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setQuestTab(t)}
                className="flex-1 rounded-[5px] px-2 py-[5px] transition-colors"
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 9,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: questTab === t ? 'var(--m-text)' : 'var(--m-sub)',
                  background: questTab === t ? 'var(--m-s3)' : 'transparent',
                  border: questTab === t ? '1px solid var(--m-border)' : '1px solid transparent',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center py-5">
            <Zap style={{ width: 16, height: 16, strokeWidth: 1, color: 'var(--m-dim)', marginBottom: 6 }} />
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'var(--m-dim)' }}>
              No {questTab.toLowerCase()} quests
            </p>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────── */}
        <div style={{ height: 1, background: 'var(--m-border)' }} />

        {/* ── Leaderboard ──────────────────────────────────────── */}
        <div className="m-fu3">
          <p
            className="mb-3 uppercase"
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'var(--m-dim)',
            }}
          >
            Leaderboard
          </p>

          {(!leaderboard || leaderboard.length === 0) ? (
            <p className="text-center py-3" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'var(--m-dim)' }}>
              No rankings yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2 mb-3">
              {leaderboard.map((u, i) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.id}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: 12,
                    color: 'var(--m-text)',
                    background: 'var(--m-s1)',
                    border: '1px solid var(--m-border)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--m-bh)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)'; }}
                >
                  <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 10, fontWeight: 600, color: 'var(--m-dim)', width: 16, textAlign: 'center' }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate" style={{ fontWeight: 500 }}>{u.displayName}</span>
                  <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 10, color: 'var(--m-dim)' }}>
                    {u.totalXp} xp
                  </span>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/portal/leaderboard"
            className="flex items-center justify-center gap-1.5 w-full rounded-lg py-2 transition-colors"
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--m-sub)',
              border: '1px solid var(--m-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--m-bh)';
              e.currentTarget.style.color = 'var(--m-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--m-border)';
              e.currentTarget.style.color = 'var(--m-sub)';
            }}
          >
            View All <ArrowRight style={{ width: 10, height: 10 }} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
