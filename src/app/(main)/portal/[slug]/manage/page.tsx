'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
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
  if (error || !data) return <p className="text-sm text-[#FF394A]">{error || 'Failed to load'}</p>;

  const { region, stats } = data;

  return (
    <div>
      <p className="mb-6 text-sm text-zinc-500">Overview of {region.name} — quick stats and actions.</p>

      {/* Stats */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Total Members', value: stats.totalMembers },
          { label: 'Pending Applications', value: stats.pendingMembers, accent: stats.pendingMembers > 0 },
          { label: 'Total Events', value: stats.totalEvents },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-200/60 p-4 text-center dark:border-zinc-800/60">
            <div className={`text-2xl font-black ${stat.accent ? 'text-[#FF394A]' : 'text-zinc-900 dark:text-zinc-100'}`}>
              {stat.value}
            </div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-zinc-200/60 p-5 dark:border-zinc-800/60">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: `/portal/${slug}/manage/members`, title: 'Manage Members', desc: 'Add, accept, or remove members', badge: stats.pendingMembers > 0 ? `${stats.pendingMembers} pending` : null },
            { href: `/portal/${slug}/manage/events`, title: 'Manage Events', desc: 'Create and manage region events', badge: null },
            { href: `/portal/${slug}/manage/guides`, title: 'Manage Guides', desc: 'Create guides and playbooks', badge: null },
            { href: `/portal/${slug}/manage/bounties`, title: 'Manage Bounties', desc: 'Create bounties and review submissions', badge: null },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="rounded-xl border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700 cursor-pointer h-full">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{action.title}</p>
                <p className="mt-0.5 text-[10px] text-zinc-500">{action.desc}</p>
                {action.badge && (
                  <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider text-[#FF394A]">{action.badge}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
