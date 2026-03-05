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
    <div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search guides..."
        className="mb-4 h-8 w-48 rounded-full border-zinc-200/50 bg-zinc-50 px-3 text-xs dark:border-zinc-800/80 dark:bg-[#18181b]"
      />
      {loading ? (
        <div className="flex justify-center py-6"><Spinner size="sm" /></div>
      ) : !guides?.length ? (
        <p className="py-4 text-center text-xs text-zinc-400">No guides found</p>
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
    <div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search programs..."
        className="mb-4 h-8 w-48 rounded-full border-zinc-200/50 bg-zinc-50 px-3 text-xs dark:border-zinc-800/80 dark:bg-[#18181b]"
      />
      {loading ? (
        <div className="flex justify-center py-6"><Spinner size="sm" /></div>
      ) : !programs?.length ? (
        <p className="py-4 text-center text-xs text-zinc-400">No programs found</p>
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
    <div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search hosted events..."
        className="mb-4 h-8 w-48 rounded-full border-zinc-200/50 bg-zinc-50 px-3 text-xs dark:border-zinc-800/80 dark:bg-[#18181b]"
      />
      {loading ? (
        <div className="flex justify-center py-6"><Spinner size="sm" /></div>
      ) : !events?.length ? (
        <p className="py-4 text-center text-xs text-zinc-400">No hosted events yet</p>
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
      <div className="mb-5 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab.key
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            {tab.label}
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

