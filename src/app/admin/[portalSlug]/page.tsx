'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { Users, CalendarDays, BookOpen, Briefcase, UserPlus, Megaphone, FileText, Lightbulb, Gift } from 'lucide-react';

interface OverviewStats {
  totalMembers: number;
  pendingMembers: number;
  totalEvents: number;
  totalGuides: number;
  totalPrograms: number;
  totalForms: number;
  totalAnnouncements: number;
  totalPlaybooks: number;
  activeProposals: number;
  totalContributions: number;
}

const statCards = [
  { key: 'totalMembers', label: 'Total Members', icon: Users, color: 'text-blue-500' },
  { key: 'pendingMembers', label: 'Pending Applications', icon: UserPlus, color: 'text-amber-500' },
  { key: 'totalEvents', label: 'Events', icon: CalendarDays, color: 'text-green-500' },
  { key: 'totalGuides', label: 'Guides', icon: BookOpen, color: 'text-purple-500' },
  { key: 'totalPrograms', label: 'Programs', icon: Briefcase, color: 'text-cyan-500' },
  { key: 'totalAnnouncements', label: 'Announcements', icon: Megaphone, color: 'text-orange-500' },
  { key: 'totalPlaybooks', label: 'Playbooks', icon: FileText, color: 'text-indigo-500' },
  { key: 'activeProposals', label: 'Active Proposals', icon: Lightbulb, color: 'text-yellow-500' },
  { key: 'totalContributions', label: 'Contributions', icon: Gift, color: 'text-pink-500' },
] as const;

const quickActions = [
  { label: 'Manage Members', href: 'members', icon: Users },
  { label: 'Manage Guides', href: 'guides', icon: BookOpen },
  { label: 'Manage Programs', href: 'programs', icon: Briefcase },
  { label: 'Manage Events', href: 'events', icon: CalendarDays },
  { label: 'Announcements', href: 'announcements', icon: Megaphone },
  { label: 'Playbooks', href: 'playbooks', icon: FileText },
  { label: 'Proposals', href: 'proposals', icon: Lightbulb },
];

export default function RegionAdminOverviewPage({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = use(params);
  const slug = portalSlug.replace(/^portal-/, '');
  const { data: stats, loading } = useApi<OverviewStats>(
    `/api/portal/regions/${slug}/admin`,
  );

  if (loading || !stats) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Regional Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Overview of your region&apos;s activity and resources.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <Card key={card.key}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
                  <p className="text-xs text-zinc-500">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={`/admin/portal-${slug}/${action.href}`}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-card p-4 text-sm font-medium text-zinc-700 transition-colors hover:border-red-500/30 hover:bg-red-500/5 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/5"
              >
                <Icon className="h-4 w-4 text-zinc-500" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
