'use client';

import React from 'react';
import { useApi } from '@/lib/hooks/use-api';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';

interface Analytics {
  totalMembers: number;
  totalEvents: number;
  totalQuests: number;
  totalRegions: number;
  pendingApplications: number;
  activeQuests: number;
  completedQuests: number;
  upcomingEvents: number;
}

export default function PortalAnalyticsPage() {
  const { data: stats, loading } = useApi<Analytics>('/api/portal/admin/analytics');

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Portal Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Members" value={stats?.totalMembers ?? 0} />
        <StatCard label="Total Events" value={stats?.totalEvents ?? 0} />
        <StatCard label="Total Quests" value={stats?.totalQuests ?? 0} />
        <StatCard label="Total Regions" value={stats?.totalRegions ?? 0} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Pending Applications" value={stats?.pendingApplications ?? 0} />
        <StatCard label="Active Quests" value={stats?.activeQuests ?? 0} />
        <StatCard label="Upcoming Events" value={stats?.upcomingEvents ?? 0} />
      </div>

      <Card className="mt-8">
        <CardTitle>Growth Charts</CardTitle>
        <div className="mt-4 flex h-48 items-center justify-center text-zinc-600">
          Charts will be rendered here with a charting library (e.g. recharts)
        </div>
      </Card>
    </div>
  );
}
