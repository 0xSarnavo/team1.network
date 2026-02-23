'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';

interface RegionManageData {
  region: { id: string; name: string; slug: string };
  stats: { totalMembers: number; pendingMembers: number; totalEvents: number };
}

export default function RegionManageOverview() {
  const params = useParams();
  const slug = params.slug as string;
  const { data, loading, error } = useApi<RegionManageData>(`/api/portal/regions/${slug}/manage`);

  if (loading) return <PageLoader />;
  if (error || !data) return <p className="text-red-400">{error || 'Failed to load'}</p>;

  const { region, stats } = data;

  return (
    <div>
      <p className="mb-6 text-zinc-400">Overview of {region.name} — quick stats and actions.</p>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Members" value={stats.totalMembers} />
        <StatCard label="Pending Applications" value={stats.pendingMembers} />
        <StatCard label="Total Events" value={stats.totalEvents} />
      </div>

      {/* Quick actions */}
      <Card>
        <CardTitle>Quick Actions</CardTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href={`/portal/regions/${slug}/manage/members`}>
            <div className="rounded-lg border border-zinc-800 p-4 hover:border-zinc-600 transition-colors cursor-pointer">
              <p className="font-medium text-zinc-200 text-sm">Manage Members</p>
              <p className="text-xs text-zinc-500 mt-1">Add, accept, or remove members</p>
              {stats.pendingMembers > 0 && (
                <Badge variant="warning" className="mt-2">{stats.pendingMembers} pending</Badge>
              )}
            </div>
          </Link>

          <Link href={`/portal/regions/${slug}/manage/events`}>
            <div className="rounded-lg border border-zinc-800 p-4 hover:border-zinc-600 transition-colors cursor-pointer">
              <p className="font-medium text-zinc-200 text-sm">Manage Events</p>
              <p className="text-xs text-zinc-500 mt-1">Create and manage region events</p>
            </div>
          </Link>

          <Link href={`/portal/regions/${slug}/manage/guides`}>
            <div className="rounded-lg border border-zinc-800 p-4 hover:border-zinc-600 transition-colors cursor-pointer">
              <p className="font-medium text-zinc-200 text-sm">Manage Guides</p>
              <p className="text-xs text-zinc-500 mt-1">Create guides and playbooks</p>
            </div>
          </Link>

          <Link href={`/portal/regions/${slug}/manage/bounties`}>
            <div className="rounded-lg border border-zinc-800 p-4 hover:border-zinc-600 transition-colors cursor-pointer">
              <p className="font-medium text-zinc-200 text-sm">Manage Bounties</p>
              <p className="text-xs text-zinc-500 mt-1">Create bounties and review submissions</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
