'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Lightbulb, MessageSquare, Plus } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  stage: string;
  createdAt: string;
  createdBy: { id: string; displayName: string; avatarUrl: string | null };
  _count: { comments: number };
}

const STAGE_COLORS: Record<string, string> = {
  proposed: 'bg-blue-900/30 text-blue-400',
  discussion: 'bg-amber-900/30 text-amber-400',
  approved: 'bg-green-900/30 text-green-400',
  rejected: 'bg-red-900/30 text-red-400',
};

export default function MemberProposalsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: proposals, loading } = useApi<Proposal[]>(`/api/portal/regions/${slug}/proposals`);
  const [view, setView] = useState<'list' | 'board'>('list');

  if (loading) return <PageLoader />;

  const stages = ['proposed', 'discussion', 'approved', 'rejected'];
  const grouped = stages.reduce((acc, stage) => {
    acc[stage] = (proposals || []).filter(p => p.stage === stage);
    return acc;
  }, {} as Record<string, Proposal[]>);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">Proposals</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-zinc-800 p-0.5">
            <button onClick={() => setView('list')} className={`rounded-md px-3 py-1.5 text-xs font-bold ${view === 'list' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500'}`}>List</button>
            <button onClick={() => setView('board')} className={`rounded-md px-3 py-1.5 text-xs font-bold ${view === 'board' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500'}`}>Board</button>
          </div>
          <Link href={`/member/${slug}/proposals/new`} className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
            <Plus className="h-4 w-4" /> New Proposal
          </Link>
        </div>
      </div>

      {!proposals || proposals.length === 0 ? (
        <EmptyState title="No proposals yet" description="Be the first to submit an idea for your region." />
      ) : view === 'board' ? (
        <div className="grid gap-4 md:grid-cols-4">
          {stages.map(stage => (
            <div key={stage}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STAGE_COLORS[stage]}`}>{stage}</span>
                <span className="text-xs text-zinc-500">({grouped[stage].length})</span>
              </div>
              <div className="space-y-2">
                {grouped[stage].map(p => (
                  <Link key={p.id} href={`/member/${slug}/proposals/${p.id}`}>
                    <Card className="hover:border-zinc-600 transition-colors">
                      <CardContent className="p-3">
                        <h3 className="text-sm font-bold text-zinc-100 line-clamp-2">{p.title}</h3>
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
                          <span>{p.createdBy.displayName}</span>
                          <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" /> {p._count.comments}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map(p => (
            <Link key={p.id} href={`/member/${slug}/proposals/${p.id}`}>
              <Card className="hover:border-zinc-600 transition-colors">
                <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-zinc-100">{p.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STAGE_COLORS[p.stage]}`}>{p.stage}</span>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-1">{p.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 shrink-0">
                    <span>{p.createdBy.displayName}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {p._count.comments}</span>
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
