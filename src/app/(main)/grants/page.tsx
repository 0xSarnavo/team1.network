'use client';

import React from 'react';
import Link from 'next/link';
import { mainGrant, otherGrants } from './grant-data';

// ---------------------------------------------------------------------------
// Shared Card Parts
// ---------------------------------------------------------------------------

function GrantThumbnail({ image, title, tall }: { image: string | null; title: string; tall?: boolean }) {
  const h = tall ? 'h-56' : 'h-40';
  if (image) {
    return <img src={image} alt={title} className={`${h} w-full object-cover`} />;
  }
  return (
    <div className={`${h} flex items-center justify-center bg-zinc-50 dark:bg-[#18181b]`}>
      <svg className="h-10 w-10 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}

function AmountBadge({ amount }: { amount: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15">
        <svg className="h-2.5 w-2.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{amount}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GrantsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full border border-zinc-200 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:border-zinc-800">
          Grants Program
        </span>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl leading-tight">
          Need funds to build out
          <br />
          your idea?
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Discover the complete list of crypto grants available to support your project.
          <br />
          Fast, equity-free funding without the hassle.
        </p>
        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500 tracking-wide">
          Equity-Free
          <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
          Transparent
          <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
          Fast AF
        </p>
      </div>

      {/* Featured / Main Grant */}
      <Link href="/grants/minigrants" className="block mb-5 group rounded-2xl border border-zinc-200 bg-card text-card-foreground transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="relative overflow-hidden">
            <GrantThumbnail image={mainGrant.image} title={mainGrant.title} tall />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#FF394A]">Featured</span>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-2xl">
              {mainGrant.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {mainGrant.description}
            </p>
            <div className="mt-4">
              <AmountBadge amount={mainGrant.amount} />
            </div>
            <div className="mt-5 max-w-[200px]">
              <span className="block w-full rounded-lg border border-zinc-200 py-2 text-center text-xs font-bold text-zinc-600 transition-all group-hover:border-[#FF394A] group-hover:bg-[#FF394A] group-hover:text-white dark:group-hover:border-[#FF394A] dark:group-hover:bg-[#FF394A] dark:group-hover:text-white">
                Apply Now
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Other Grants — Section label */}
      <div className="mb-4 mt-10">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">More Grants</h2>
      </div>

      {/* Other Grants Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {otherGrants.map((grant) => (
          <Link
            key={grant.slug}
            href="/grants/minigrants"
            className="group rounded-2xl border border-zinc-200 bg-card text-card-foreground transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700"
          >
            <div className="relative overflow-hidden rounded-t-2xl">
              <GrantThumbnail image={grant.image} title={grant.title} />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {grant.title}
              </h3>
              <div className="mt-1.5">
                <AmountBadge amount={grant.amount} />
              </div>
              <div className="mt-4">
                <span className="block w-full rounded-lg border border-zinc-200 py-2 text-center text-xs font-bold text-zinc-600 transition-all group-hover:border-[#FF394A] group-hover:bg-[#FF394A] group-hover:text-white dark:group-hover:border-[#FF394A] dark:group-hover:bg-[#FF394A] dark:group-hover:text-white">
                  Apply Now
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
