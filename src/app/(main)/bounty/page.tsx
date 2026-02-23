'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface BountyItem {
  id: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  type: string;
  status: string;
  maxSubmissions: number | null;
  startsAt: string | null;
  endsAt: string | null;
  proofRequirements: string | null;
  submissionCount: number;
  creator: { id: string; displayName: string; avatarUrl: string | null };
  createdAt: string;
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'development', label: 'Development' },
  { value: 'security', label: 'Security' },
  { value: 'content', label: 'Content' },
  { value: 'translation', label: 'Translation' },
  { value: 'design', label: 'Design' },
  { value: 'community', label: 'Community' },
];

const CATEGORY_COLORS: Record<string, string> = {
  development: 'text-blue-400 bg-blue-900/30 border-blue-800',
  security: 'text-red-400 bg-red-900/30 border-red-800',
  content: 'text-green-400 bg-green-900/30 border-green-800',
  translation: 'text-purple-400 bg-purple-900/30 border-purple-800',
  design: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
  community: 'text-cyan-400 bg-cyan-900/30 border-cyan-800',
};

const CATEGORY_ICONS: Record<string, string> = {
  development: '{ }',
  security: '\u{1F6E1}',
  content: '\u{270D}',
  translation: '\u{1F310}',
  design: '\u{1F3A8}',
  community: '\u{1F465}',
};

const TYPE_LABELS: Record<string, string> = {
  one_time: 'One-time',
  recurring_weekly: 'Weekly',
  recurring_monthly: 'Monthly',
};

export default function BountyPage() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams = new URLSearchParams();
  if (category) queryParams.set('category', category);
  if (searchDebounced) queryParams.set('search', searchDebounced);
  const qs = queryParams.toString();

  const { data: bounties, loading } = useApi<BountyItem[]>(`/api/bounty${qs ? `?${qs}` : ''}`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <div className="mb-10 text-center">
        <Badge variant="warning" className="mb-4">Bounty Board</Badge>
        <h1 className="text-4xl font-bold text-zinc-100 md:text-5xl">Earn While You Build</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
          Complete bounties to earn XP and climb the leaderboard. From development to design,
          there are opportunities for every skill set.
        </p>
      </div>

      {/* How it works (compact) */}
      <div className="mb-10 grid gap-4 md:grid-cols-4">
        {[
          { step: '1', title: 'Browse', desc: 'Find a bounty that matches your skills.' },
          { step: '2', title: 'Submit', desc: 'Complete the task and submit proof.' },
          { step: '3', title: 'Review', desc: 'A reviewer verifies your submission.' },
          { step: '4', title: 'Earn XP', desc: 'Get rewarded with XP upon approval.' },
        ].map((item) => (
          <div key={item.step} className="text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-red-900/30 text-red-400 font-bold text-sm mb-2">
              {item.step}
            </div>
            <h3 className="font-semibold text-zinc-200 text-sm">{item.title}</h3>
            <p className="mt-0.5 text-xs text-zinc-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat.value
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search bounties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Bounty list */}
      {loading ? (
        <PageLoader />
      ) : !bounties || bounties.length === 0 ? (
        <EmptyState
          title="No bounties found"
          description={category || searchDebounced ? 'Try adjusting your filters.' : 'Check back soon for new bounties.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bounties.map((bounty) => (
            <Link key={bounty.id} href={`/bounty/${bounty.id}`}>
              <Card className="h-full hover:border-zinc-600 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[bounty.category] || 'text-zinc-400 bg-zinc-800'}`}>
                    <span>{CATEGORY_ICONS[bounty.category] || ''}</span>
                    {bounty.category}
                  </span>
                  <span className="rounded-full bg-green-900/40 px-2 py-0.5 text-xs font-bold text-green-400">
                    +{bounty.xpReward} XP
                  </span>
                </div>

                <h3 className="text-base font-semibold text-zinc-100 mb-2 line-clamp-2">{bounty.title}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{bounty.description}</p>

                <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <Badge variant="default">{TYPE_LABELS[bounty.type] || bounty.type}</Badge>
                  <span>{bounty.submissionCount} submission{bounty.submissionCount !== 1 ? 's' : ''}</span>
                  {bounty.endsAt && (
                    <span>Ends {new Date(bounty.endsAt).toLocaleDateString()}</span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
