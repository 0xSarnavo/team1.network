'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

// ---------------------------------------------------------------------------
// Quick‑links config
// ---------------------------------------------------------------------------

const quickLinks = [
  { label: 'All Events', href: '/portal/events', color: 'text-blue-400' },
  { label: 'All Quests', href: '/portal/quests', color: 'text-yellow-400' },
  { label: 'Browse Regions', href: '/portal', color: 'text-green-400' },
  { label: 'Membership', href: '/portal/membership', color: 'text-cyan-400' },
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
      {/* Quick Links                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-zinc-100">Quick Links</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:border-zinc-700 transition-colors cursor-pointer text-center">
                <span className={`text-lg font-semibold ${link.color}`}>{link.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
