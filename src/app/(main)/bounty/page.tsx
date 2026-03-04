'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
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
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      {/* Hero — simplified */}
      <div className="mb-10 text-center">
        <span className="mb-4 inline-block rounded-full border border-zinc-200 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
          Bounty Board
        </span>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
          Earn While You Build
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-500 dark:text-zinc-400">
          Complete bounties to earn XP and climb the leaderboard. From development to design,
          there are opportunities for every skill set.
        </p>
      </div>

      {/* Filters — search + dropdown */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-56">
          <Input
            placeholder="Search bounties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border-zinc-200 bg-transparent text-sm dark:border-zinc-800"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-600 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:focus:border-zinc-600 sm:w-48"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bounties.map((bounty) => (
            <Link key={bounty.id} href={`/bounty/${bounty.id}`}>
              <div className="group h-full rounded-2xl border border-zinc-200 bg-card text-card-foreground transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700 overflow-hidden">
                {/* Image placeholder */}
                <div className="flex h-36 items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                  <svg className="h-8 w-8 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Category + XP row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {bounty.category}
                    </span>
                    <span className="rounded-full bg-[#FF394A]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#FF394A]">
                      +{bounty.xpReward} XP
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 line-clamp-2">{bounty.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">{bounty.description}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4">
                    <span>{TYPE_LABELS[bounty.type] || bounty.type}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span>{bounty.submissionCount} submission{bounty.submissionCount !== 1 ? 's' : ''}</span>
                    {bounty.endsAt && (
                      <>
                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                        <span>Ends {new Date(bounty.endsAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>

                  {/* Apply button */}
                  <span className="block w-full rounded-lg border border-zinc-200 py-2 text-center text-xs font-bold text-zinc-600 transition-all group-hover:border-[#FF394A] group-hover:bg-[#FF394A] group-hover:text-white dark:border-zinc-700 dark:text-zinc-400 dark:group-hover:border-[#FF394A] dark:group-hover:bg-[#FF394A] dark:group-hover:text-white">
                    View & Apply
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
