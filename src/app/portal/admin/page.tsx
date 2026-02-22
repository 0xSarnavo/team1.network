'use client';

import React from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';

interface PortalStats {
  totalMembers: number;
  totalEvents: number;
  totalQuests: number;
  totalRegions: number;
  pendingApplications: number;
}

const adminLinks = [
  { href: '/portal/admin/regions', label: 'Regions', desc: 'Manage community regions' },
  { href: '/portal/admin/members', label: 'Members', desc: 'Review & manage members' },
  { href: '/portal/admin/events', label: 'Events', desc: 'Manage events & host applications' },
  { href: '/portal/admin/quests', label: 'Quests', desc: 'Create & review quests' },
  { href: '/portal/admin/guides', label: 'Guides', desc: 'Manage community guides' },
  { href: '/portal/admin/analytics', label: 'Analytics', desc: 'View stats & metrics' },
];

export default function PortalAdminPage() {
  const { data: stats, loading } = useApi<PortalStats>('/api/portal/admin/analytics');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Portal Admin</h1>

      {loading ? <PageLoader /> : stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Members" value={stats.totalMembers} />
          <StatCard label="Total Events" value={stats.totalEvents} />
          <StatCard label="Active Quests" value={stats.totalQuests} />
          <StatCard label="Pending Apps" value={stats.pendingApplications} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:border-red-900/50 transition-colors cursor-pointer h-full">
              <CardTitle>{link.label}</CardTitle>
              <p className="mt-2 text-sm text-zinc-500">{link.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
