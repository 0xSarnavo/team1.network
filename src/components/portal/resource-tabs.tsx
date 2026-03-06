'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { useRegionFilter } from './region-filter-context';
import { BentoCard } from './bento-card';
import { HorizontalCarousel } from './horizontal-carousel';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Guide {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  category: string | null;
  readTime: number | null;
}

interface Program {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  hasApplied: boolean;
}

type TabKey = 'guides' | 'programs' | 'host';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'guides', label: 'Guides' },
  { key: 'programs', label: 'Programs' },
  { key: 'host', label: 'Host' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GuidesTab() {
  const { selectedRegion } = useRegionFilter();
  const [search, setSearch] = useState('');
  const { data: guides, loading } = useApi<Guide[]>(
    `/api/portal/guides?search=${search}&region=${selectedRegion}`
  );

  return (
    <div className="w-full">
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="h-9 w-full rounded-xl border-zinc-200 bg-white pl-9 text-xs transition-colors hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-zinc-700"
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-6"><Spinner size="sm" /></div>
      ) : !guides?.length ? (
        <div className="flex w-full flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 h-[1px] w-6 bg-zinc-800" />
          <svg className="mb-3 h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="mb-2 text-sm font-bold text-zinc-900 dark:text-white">No guides found</h3>
          <p className="text-xs text-zinc-500 max-w-[200px]">Community guides will appear here once published.</p>
        </div>
      ) : (
        <HorizontalCarousel>
          {guides.map((g) => (
            <Link key={g.id} href={`/portal/guides/${g.slug}`} className="block w-52 shrink-0">
              <div className="flex h-full flex-col rounded-xl border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700">
                {g.category && (
                  <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{g.category}</span>
                )}
                <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 dark:text-zinc-100">{g.title}</h3>
                {g.summary && <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{g.summary}</p>}
                {g.readTime && <p className="mt-auto pt-2 text-[10px] text-zinc-400">{g.readTime} min read</p>}
              </div>
            </Link>
          ))}
        </HorizontalCarousel>
      )}
    </div>
  );
}

function ProgramsTab() {
  const { selectedRegion } = useRegionFilter();
  const [search, setSearch] = useState('');
  const { data: programs, loading } = useApi<Program[]>(
    `/api/portal/programs?search=${search}&region=${selectedRegion}`
  );

  const statusDot = (status: string) => {
    const c = status === 'active' ? 'bg-emerald-500/70' : status === 'upcoming' ? 'bg-sky-500/50' : 'bg-zinc-400/40';
    return <span className={`inline-block h-1.5 w-1.5 rounded-full ${c}`} />;
  };

  return (
    <div className="w-full">
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search programs..."
          className="h-9 w-full rounded-xl border-zinc-200 bg-white pl-9 text-xs transition-colors hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-zinc-700"
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-6"><Spinner size="sm" /></div>
      ) : !programs?.length ? (
        <div className="flex w-full flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 h-[1px] w-6 bg-zinc-800" />
          <svg className="mb-3 h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="mb-2 text-sm font-bold text-zinc-900 dark:text-white">No programs found</h3>
          <p className="text-xs text-zinc-500 max-w-[200px]">Check back later for active community programs.</p>
        </div>
      ) : (
        <HorizontalCarousel>
          {programs.map((p) => (
            <div key={p.id} className="w-52 shrink-0">
              <div className="flex h-full flex-col rounded-xl border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {statusDot(p.status)}
                  <span>{p.status}</span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 dark:text-zinc-100">{p.title}</h3>
                {p.description && <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{p.description}</p>}
                {(p.startDate || p.endDate) && (
                  <p className="mt-auto pt-2 text-[10px] text-zinc-400">
                    {p.startDate && new Date(p.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {p.endDate && ` — ${new Date(p.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </p>
                )}
                {p.hasApplied && (
                  <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">Applied</span>
                )}
              </div>
            </div>
          ))}
        </HorizontalCarousel>
      )}
    </div>
  );
}

function HostTab() {
  const { selectedRegion } = useRegionFilter();
  const [search, setSearch] = useState('');
  const { data: events, loading } = useApi<{ id: string; title: string; date: string | null; type: string }[]>(
    `/api/portal/events/hosted?search=${search}&region=${selectedRegion}`
  );

  return (
    <div className="w-full">
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hosted events..."
          className="h-9 w-full rounded-xl border-zinc-200 bg-white pl-9 text-xs text-zinc-900 placeholder:text-zinc-500 transition-colors hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-700"
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-6"><Spinner size="sm" /></div>
      ) : !events?.length ? (
        <div className="flex w-full flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 h-[1px] w-6 bg-zinc-800" />
          <svg className="mb-3 h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mb-2 text-sm font-bold text-zinc-900 dark:text-white">No hosted events</h3>
          <p className="text-xs text-zinc-500 max-w-[200px]">You haven't hosted any events matching this search.</p>
        </div>
      ) : (
        <HorizontalCarousel>
          {events.map((e) => (
            <div key={e.id} className="w-52 shrink-0">
              <div className="flex h-full flex-col rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700">
                <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{e.type}</span>
                <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 dark:text-zinc-100">{e.title}</h3>
                {e.date && <p className="mt-auto pt-2 text-[10px] text-zinc-400">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
              </div>
            </div>
          ))}
        </HorizontalCarousel>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ResourceTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('guides');

  return (
    <BentoCard>
      {/* Tab bar */}
      <div className="flex w-full border-b border-zinc-200 dark:border-zinc-800/60 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-[11px] font-bold tracking-wider uppercase transition-colors relative mr-6 ${
              activeTab === tab.key
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900 dark:bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content — min-height prevents layout shift */}
      <div className="min-h-[120px]">
        {activeTab === 'guides' && <GuidesTab />}
        {activeTab === 'programs' && <ProgramsTab />}
        {activeTab === 'host' && <HostTab />}
      </div>
    </BentoCard>
  );
}

