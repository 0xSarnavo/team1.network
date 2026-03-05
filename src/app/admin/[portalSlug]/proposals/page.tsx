'use client';

import React, { use } from 'react';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { MessageSquare } from 'lucide-react';

interface ProposalItem {
  id: string;
  title: string;
  description: string;
  stage: string;
  createdAt: string;
  createdBy: { id: string; displayName: string; avatarUrl: string | null };
  _count: { comments: number };
}

const STAGES = ['proposed', 'discussion', 'approved', 'rejected'] as const;

const STAGE_COLORS: Record<string, string> = {
  proposed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  discussion: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STAGE_TRANSITIONS: Record<string, string[]> = {
  proposed: ['discussion'],
  discussion: ['approved', 'rejected'],
};

export default function RegionAdminProposalsPage({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = use(params);
  const slug = portalSlug.replace(/^portal-/, '');
  const apiBase = `/api/portal/regions/${slug}/admin/proposals`;
  const { data: proposals, loading, refetch } = useApi<ProposalItem[]>(apiBase);
  const { mutate: patch } = useMutation<unknown>('patch');

  const handleStageChange = async (id: string, stage: string) => {
    const res = await patch(`${apiBase}/${id}`, { stage });
    if (res.success) refetch();
  };

  if (loading) return <PageLoader />;

  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage] = (proposals || []).filter(p => p.stage === stage);
    return acc;
  }, {} as Record<string, ProposalItem[]>);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Proposals</h1>

      {!proposals || proposals.length === 0 ? (
        <EmptyState title="No proposals" description="Members haven't submitted any proposals yet." />
      ) : (
        <div className="space-y-8">
          {STAGES.map(stage => (
            <div key={stage}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STAGE_COLORS[stage]}`}>{stage}</span>
                <span className="text-xs text-zinc-500">({grouped[stage].length})</span>
              </div>
              {grouped[stage].length === 0 ? (
                <p className="text-xs text-zinc-500 pl-2">No proposals in this stage.</p>
              ) : (
                <div className="space-y-2">
                  {grouped[stage].map(p => (
                    <Card key={p.id}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{p.title}</p>
                            <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{p.description}</p>
                            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                              <span>by {p.createdBy.displayName}</span>
                              <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {p._count.comments}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {(STAGE_TRANSITIONS[p.stage] || []).map(next => (
                              <button
                                key={next}
                                onClick={() => handleStageChange(p.id, next)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  next === 'approved' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' :
                                  next === 'rejected' ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20' :
                                  'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                                }`}
                              >
                                {next === 'discussion' ? 'Open Discussion' : next === 'approved' ? 'Approve' : 'Reject'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
