'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, FileText, ArrowRight } from 'lucide-react';

interface PlaybooksHeroProps {
  slug: string;
}

interface QuickItem {
  name: string;
  meta: string;
}

const QUICK_ITEMS: QuickItem[] = [
  { name: 'Onboarding SOP', meta: '6 steps · 5 min' },
  { name: 'Region Lead Guide', meta: '12 steps · 15 min' },
  { name: 'Quest Strategy', meta: '4 steps · 8 min' },
];

export function PlaybooksHero({ slug }: PlaybooksHeroProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 rounded-[11px] overflow-hidden"
      style={{
        border: '1px solid var(--m-border)',
        minHeight: 160,
      }}
    >
      {/* Left Panel */}
      <div
        className="flex flex-col justify-between"
        style={{
          padding: 20,
          borderRight: '1px solid var(--m-border)',
          background: 'var(--m-s1)',
        }}
      >
        {/* Featured Tag */}
        <div className="mb-3">
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-1"
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 9,
              color: 'var(--m-sub)',
              background: 'var(--m-s2)',
              border: '1px solid var(--m-border)',
            }}
          >
            <BookOpen style={{ width: 9, height: 9 }} />
            Featured
          </span>
        </div>

        <h3
          className="mb-2"
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 16,
            fontWeight: 800,
            color: 'var(--m-text)',
          }}
        >
          Strategy &amp; SOPs
        </h3>

        <p
          className="mb-4"
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            color: 'var(--m-sub)',
            lineHeight: 1.6,
          }}
        >
          Structured guides to help you operate as an effective community member, region lead, or contributor.
        </p>

        <Link
          href={`/member/${slug}/playbooks`}
          className="inline-flex items-center gap-1.5 self-start rounded-lg px-3.5 py-2 transition-opacity hover:opacity-90"
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            fontWeight: 600,
            background: 'var(--m-text)',
            color: 'var(--m-bg)',
          }}
        >
          Open Library
          <ArrowRight style={{ width: 11, height: 11 }} />
        </Link>
      </div>

      {/* Right Panel */}
      <div
        className="flex flex-col"
        style={{
          padding: 20,
          background: 'var(--m-s1)',
        }}
      >
        <p
          className="mb-3 uppercase"
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '1.5px',
            color: 'var(--m-dim)',
          }}
        >
          Quick Access
        </p>

        <div className="flex flex-col gap-2">
          {QUICK_ITEMS.map((item) => (
            <Link
              key={item.name}
              href={`/member/${slug}/playbooks`}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors"
              style={{
                background: 'var(--m-s2)',
                border: '1px solid var(--m-border)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--m-bh)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)'; }}
            >
              <div
                className="flex items-center justify-center rounded-md"
                style={{
                  width: 24,
                  height: 24,
                  background: 'var(--m-s3)',
                }}
              >
                <FileText style={{ width: 11, height: 11, color: 'var(--m-sub)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--m-text)',
                  }}
                >
                  {item.name}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 10,
                    color: 'var(--m-sub)',
                  }}
                >
                  {item.meta}
                </p>
              </div>
              <ArrowRight style={{ width: 11, height: 11, color: 'var(--m-dim)' }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
