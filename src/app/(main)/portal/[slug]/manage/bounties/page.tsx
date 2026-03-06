'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

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
  createdAt: string;
}

interface RegionInfo {
  region: { id: string; name: string; slug: string };
}

const TYPE_LABELS: Record<string, string> = {
  one_time: 'One-time',
  recurring_weekly: 'Weekly',
  recurring_monthly: 'Monthly',
};

export default function RegionManageBountiesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const { data: regionInfo } = useApi<RegionInfo>(`/api/portal/regions/${slug}/manage`);
  const regionId = regionInfo?.region?.id;

  const { data: bounties, loading } = useApi<BountyItem[]>(
    regionId ? `/api/bounty/admin?regionId=${regionId}` : '',
    { immediate: !!regionId }
  );

  if (loading || !regionInfo) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500">Manage bounties for {regionInfo.region.name}.</p>
        <div className="flex gap-2">
          <Link href={`/portal/${slug}/bounties/submissions`}>
            <button className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-bold text-zinc-600 transition-all hover:bg-zinc-900 hover:text-white hover:border-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-white dark:hover:text-zinc-900 dark:hover:border-white active:scale-95">
              Review Submissions
            </button>
          </Link>
          <Link href={`/portal/${slug}/bounties/reviewers`}>
            <button className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-bold text-zinc-600 transition-all hover:bg-zinc-900 hover:text-white hover:border-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-white dark:hover:text-zinc-900 dark:hover:border-white active:scale-95">
              Reviewers
            </button>
          </Link>
          <Link href={`/portal/${slug}/bounties`}>
            <button className="rounded-full bg-zinc-900 px-5 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90 dark:bg-white dark:text-zinc-900 active:scale-95">
              Manage Bounties
            </button>
          </Link>
        </div>
      </div>

      {!bounties || bounties.length === 0 ? (
        <EmptyState
          title="No bounties yet"
          description="Create bounties to reward community contributions."
          action={{ label: 'Create Bounty', onClick: () => router.push(`/portal/${slug}/bounties`) }}
        />
      ) : (
        <div className="space-y-2">
          {bounties.map((b) => (
            <div key={b.id} className="rounded-2xl border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <span className={b.status === 'active' ? 'text-emerald-500/70' : b.status === 'archived' ? 'text-rose-500/70' : ''}>{b.status}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span>{b.category}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span>{TYPE_LABELS[b.type] || b.type}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-[#FF394A]">+{b.xpReward} XP</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{b.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-zinc-400">
                    <span>{b.submissionCount} submissions</span>
                    {b.maxSubmissions && <span>Max: {b.maxSubmissions}</span>}
                    {b.endsAt && <span>Ends: {new Date(b.endsAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <Link href={`/portal/${slug}/bounties`}>
                  <button className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
