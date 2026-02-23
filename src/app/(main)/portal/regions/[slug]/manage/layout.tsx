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
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/portal/regions/${slug}`}
          className="mb-3 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          &larr; Back to Region
        </Link>
        <h1 className="text-3xl font-bold text-zinc-100">Manage Region</h1>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-zinc-800 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const href = `${basePath}${tab.key}`;
          const isActive = tab.key === ''
            ? pathname === basePath
            : pathname.startsWith(href);

          return (
            <Link
              key={tab.key}
              href={href}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                isActive
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
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
