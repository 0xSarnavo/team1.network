'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { StatCard } from '@/components/ui/stat-card';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardRegion {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  role: string;
  isPrimary: boolean;
}

interface QuestSubmission {
  submissionId: string;
  quest: {
    id: string;
    title: string;
    xpReward: number;
    difficulty: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  type: string;
}

interface DashboardData {
  user: {
    totalXp: number;
    level: number;
    displayName: string;
  };
  regions: DashboardRegion[];
  questProgress: QuestSubmission[];
  upcomingEvents: UpcomingEvent[];
}

interface BountyItem {
  id: string;
  title: string;
  category: string;
  xpReward: number;
  type: string;
  status: string;
  submissionCount: number;
  maxSubmissions: number | null;
  endsAt: string | null;
}

interface BountySubmission {
  id: string;
  bountyId: string;
  status: string;
  createdAt: string;
  bounty: {
    id: string;
    title: string;
    xpReward: number;
    category: string;
  };
}

interface XpTransaction {
  id: string;
  amount: number;
  sourceType: string;
  description: string | null;
  createdAt: string;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function questStatusVariant(status: QuestSubmission['status']) {
  switch (status) {
    case 'approved':
      return 'success' as const;
    case 'rejected':
      return 'danger' as const;
    default:
      return 'warning' as const;
  }
}

function difficultyVariant(difficulty: string) {
  switch (difficulty) {
    case 'easy':
      return 'success' as const;
    case 'hard':
      return 'danger' as const;
    default:
      return 'warning' as const;
  }
}

function submissionStatusVariant(status: string) {
  switch (status) {
    case 'approved':
      return 'success' as const;
    case 'rejected':
      return 'danger' as const;
    default:
      return 'warning' as const;
  }
}

const XP_SOURCE_LABELS: Record<string, string> = {
  bounty_base: 'Bounty Reward',
  bounty_winner: 'Bounty Winner Bonus',
  quest_complete: 'Quest Completed',
  event_attend: 'Event Attendance',
  event_host: 'Event Hosted',
  grant_milestone: 'Grant Milestone',
  profile_complete: 'Profile Completed',
  badge_bonus: 'Badge Bonus',
  community: 'Community Contribution',
  manual: 'Manual Award',
};

const RANK_STYLES: Record<number, string> = {
  1: 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
  2: 'text-zinc-300 bg-zinc-700/30 border-zinc-600',
  3: 'text-orange-400 bg-orange-900/30 border-orange-700',
};

// ---------------------------------------------------------------------------
// Quick‑links config
// ---------------------------------------------------------------------------

const quickLinks = [
  { label: 'Browse Bounties', href: '/bounty', color: 'text-red-400', desc: 'Find bounties to earn XP' },
  { label: 'All Quests', href: '/portal/quests', color: 'text-yellow-400', desc: 'Complete quests for rewards' },
  { label: 'All Events', href: '/portal/events', color: 'text-blue-400', desc: 'Discover upcoming events' },
  { label: 'Leaderboard', href: '/portal/leaderboard', color: 'text-green-400', desc: 'See top members' },
  { label: 'Browse Regions', href: '/portal', color: 'text-cyan-400', desc: 'Explore regional communities' },
  { label: 'Membership', href: '/portal/membership', color: 'text-purple-400', desc: 'Manage your membership' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const { data, loading, error } = useApi<DashboardData>(
    authUser ? '/api/portal/dashboard' : '',
    { immediate: !!authUser },
  );

  // Additional data fetches for new sections
  const { data: activeBounties } = useApi<BountyItem[]>(
    authUser ? '/api/bounty?limit=5' : '',
    { immediate: !!authUser },
  );

  const { data: mySubmissions } = useApi<BountySubmission[]>(
    authUser ? '/api/bounty/my-submissions?limit=5' : '',
    { immediate: !!authUser },
  );

  const { data: xpHistory } = useApi<XpTransaction[]>(
    authUser ? '/api/portal/xp-history?limit=8' : '',
    { immediate: !!authUser },
  );

  const { data: leaderboard } = useApi<LeaderboardUser[]>(
    authUser ? '/api/leaderboard/members?limit=5' : '',
    { immediate: !!authUser },
  );

  // ---- Loading / error states ----
  if (loading || !data) return <PageLoader />;

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-red-400">Failed to load dashboard. Please try again later.</p>
      </div>
    );
  }

  const { user, regions, questProgress, upcomingEvents } = data;

  // ---- Derived values ----
  const pendingQuests = questProgress.filter((q) => q.status === 'pending').length;
  const approvedQuests = questProgress.filter((q) => q.status === 'approved').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* ---------------------------------------------------------------- */}
      {/* Welcome Header                                                    */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">
          Welcome back, <span className="text-red-500">{user.displayName}</span>
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <Badge variant="info">Level {user.level}</Badge>
          <Badge variant="success">{user.totalXp.toLocaleString()} XP</Badge>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Stat Cards                                                        */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Level" value={user.level} />
        <StatCard label="Total XP" value={user.totalXp.toLocaleString()} />
        <StatCard label="Regions" value={regions.length} />
        <StatCard label="Quests Completed" value={approvedQuests} />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Two-column layout: Bounties + Leaderboard                        */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-10 grid gap-6 lg:grid-cols-3">
        {/* Active Bounties — 2 cols */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-100">Active Bounties</h2>
            <Link href="/bounty" className="text-sm text-red-400 hover:text-red-300">
              View all &rarr;
            </Link>
          </div>

          {!activeBounties || activeBounties.length === 0 ? (
            <EmptyState
              title="No active bounties"
              description="Check back later for new bounties to earn XP."
            />
          ) : (
            <div className="space-y-2">
              {activeBounties.slice(0, 5).map((b) => (
                <Link key={b.id} href={`/bounty/${b.id}`}>
                  <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="default">{b.category}</Badge>
                          <span className="text-xs font-medium text-green-400">+{b.xpReward} XP</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-200 truncate">{b.title}</p>
                      </div>
                      <div className="text-xs text-zinc-500 shrink-0">
                        {b.submissionCount} submissions
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* My Bounty Submissions */}
          {mySubmissions && mySubmissions.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-200">My Submissions</h3>
                <Link href="/bounty" className="text-sm text-zinc-500 hover:text-zinc-300">
                  View all &rarr;
                </Link>
              </div>
              <Card>
                <CardContent className="divide-y divide-zinc-800">
                  {mySubmissions.slice(0, 5).map((s) => (
                    <Link
                      key={s.id}
                      href={`/bounty/${s.bountyId}`}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-zinc-800/30 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-200 truncate">{s.bounty.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Submitted {formatDate(s.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-green-400">+{s.bounty.xpReward} XP</span>
                        <Badge variant={submissionStatusVariant(s.status)}>{s.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Leaderboard Preview — 1 col */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-100">Top Members</h2>
            <Link href="/portal/leaderboard" className="text-sm text-red-400 hover:text-red-300">
              Full board &rarr;
            </Link>
          </div>

          {!leaderboard || leaderboard.length === 0 ? (
            <Card>
              <p className="py-6 text-center text-sm text-zinc-500">No rankings yet.</p>
            </Card>
          ) : (
            <Card>
              <CardContent className="space-y-3">
                {leaderboard.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                        RANK_STYLES[u.rank] ? `border ${RANK_STYLES[u.rank]}` : 'text-zinc-500'
                      }`}
                    >
                      {u.rank}
                    </span>
                    <Avatar src={u.avatarUrl} alt={u.displayName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-200 truncate">{u.displayName}</p>
                      {u.username && (
                        <p className="text-xs text-zinc-500 truncate">@{u.username}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-green-400">{u.totalXp.toLocaleString()}</p>
                      <p className="text-xs text-zinc-500">Lv.{u.level}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* XP History                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-zinc-100">XP History</h2>

        {!xpHistory || xpHistory.length === 0 ? (
          <EmptyState
            title="No XP earned yet"
            description="Complete quests, bounties, and attend events to earn XP."
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-zinc-800">
              {xpHistory.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200">
                      {XP_SOURCE_LABELS[tx.sourceType] || tx.sourceType}
                    </p>
                    {tx.description && (
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{tx.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount} XP
                    </span>
                    <span className="text-xs text-zinc-600">{formatDate(tx.createdAt)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* My Regions                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-zinc-100">My Regions</h2>

        {regions.length === 0 ? (
          <EmptyState
            title="You haven't joined a region yet"
            description="Regions are local communities where you can attend events, earn XP, and connect with others."
            action={{
              label: 'Join a Region',
              onClick: () => {
                window.location.href = '/portal/membership';
              },
            }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <Link key={region.id} href={`/portal/regions/${region.slug}`}>
                <Card className="hover:border-red-900/50 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-3">
                    {region.logoUrl ? (
                      <img
                        src={region.logoUrl}
                        alt={region.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900/30 text-red-400 font-bold">
                        {region.name[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-zinc-200 truncate">{region.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="default">{region.role}</Badge>
                        {region.isPrimary && <Badge variant="info">Primary</Badge>}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Upcoming Events                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-zinc-100">Upcoming Events</h2>

        {upcomingEvents.length === 0 ? (
          <EmptyState
            title="No upcoming events"
            description="RSVP to events to see them here."
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-zinc-800">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/portal/events/${event.id}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:bg-zinc-800/30 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-200 truncate">{event.title}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {formatDateTime(event.startDate)}
                      {event.location && ` \u00B7 ${event.location}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={event.isVirtual ? 'info' : 'default'}>
                      {event.isVirtual ? 'Virtual' : 'In-Person'}
                    </Badge>
                    <Badge variant="default">{event.type}</Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Quest Progress                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-100">Quest Progress</h2>
          {pendingQuests > 0 && (
            <Badge variant="warning">{pendingQuests} pending</Badge>
          )}
        </div>

        {questProgress.length === 0 ? (
          <EmptyState
            title="No quest submissions yet"
            description="Complete quests to earn XP and track your progress here."
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-zinc-800">
              {questProgress.map((submission) => (
                <Link
                  key={submission.submissionId}
                  href={`/portal/quests/${submission.quest.id}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:bg-zinc-800/30 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-200 truncate">
                      {submission.quest.title}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      Submitted {formatDate(submission.submittedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={difficultyVariant(submission.quest.difficulty)}>
                      {submission.quest.difficulty}
                    </Badge>
                    <Badge variant="success">+{submission.quest.xpReward} XP</Badge>
                    <Badge variant={questStatusVariant(submission.status)}>
                      {submission.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Quick Actions                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-zinc-100">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
                <p className={`text-base font-semibold ${link.color}`}>{link.label}</p>
                <p className="text-xs text-zinc-500 mt-1">{link.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
