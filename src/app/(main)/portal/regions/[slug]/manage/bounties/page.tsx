'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  draft: 'default',
  active: 'success',
  completed: 'info',
  archived: 'danger',
};

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
        <div>
          <p className="text-zinc-400">Manage bounties for {regionInfo.region.name}.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/portal/regions/${slug}/bounties/submissions`}>
            <Button variant="outline" size="sm">Review Submissions</Button>
          </Link>
          <Link href={`/portal/regions/${slug}/bounties/reviewers`}>
            <Button variant="outline" size="sm">Reviewers</Button>
          </Link>
          <Link href={`/portal/regions/${slug}/bounties`}>
            <Button>Manage Bounties</Button>
          </Link>
        </div>
      </div>

      {!bounties || bounties.length === 0 ? (
        <EmptyState
          title="No bounties yet"
          description="Create bounties to reward community contributions."
          action={{ label: 'Create Bounty', onClick: () => router.push(`/portal/regions/${slug}/bounties`) }}
        />
      ) : (
        <div className="space-y-3">
          {bounties.map((b) => (
            <Card key={b.id} className="hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant={STATUS_BADGE[b.status] || 'default'}>{b.status}</Badge>
                    <Badge variant="default">{b.category}</Badge>
                    <Badge variant="default">{TYPE_LABELS[b.type] || b.type}</Badge>
                    <span className="text-xs font-medium text-green-400">+{b.xpReward} XP</span>
                  </div>
                  <h3 className="text-base font-semibold text-zinc-100 truncate">{b.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-zinc-600">
                    <span>{b.submissionCount} submissions</span>
                    {b.maxSubmissions && <span>Max: {b.maxSubmissions}</span>}
                    {b.endsAt && <span>Ends: {new Date(b.endsAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <Link href={`/portal/regions/${slug}/bounties`}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
