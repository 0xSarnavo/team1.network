'use client';

import React from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';

const TABS = [
  { key: '', label: 'Overview' },
  { key: '/members', label: 'Members' },
  { key: '/events', label: 'Events' },
  { key: '/guides', label: 'Guides' },
  { key: '/bounties', label: 'Bounties' },
];

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params.slug as string;
  const pathname = usePathname();
  const basePath = `/portal/regions/${slug}/manage`;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-24">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/portal/regions/${slug}`}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Manage Region</h1>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const href = `${basePath}${tab.key}`;
          const isActive = tab.key === ''
            ? pathname === basePath
            : pathname.startsWith(href);

          return (
            <Link
              key={tab.key}
              href={href}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Tab content */}
      {children}
    </div>
  );
}
