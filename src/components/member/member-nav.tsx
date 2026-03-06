'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Settings, ChevronDown } from 'lucide-react';

interface MemberNavProps {
  regionName?: string;
  userName?: string;
  slug: string;
}

export function MemberNav({ regionName = 'Global', userName = 'Builder', slug }: MemberNavProps) {
  return (
    <header
      className="sticky top-0 z-[200] flex items-center justify-between px-5"
      style={{
        height: 52,
        background: 'rgba(7,7,8,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--m-border)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <Link
          href="/portal/global"
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 15,
            fontWeight: 800,
            color: 'var(--m-text)',
            letterSpacing: '-0.3px',
          }}
        >
          team<span style={{ color: 'var(--m-red)' }}>1</span>
        </Link>

        {/* Separator */}
        <div style={{ width: 1, height: 20, background: 'var(--m-border)' }} />

        {/* Region pill */}
        <button
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-colors"
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--m-sub)',
            background: 'var(--m-s2)',
            border: '1px solid var(--m-border)',
          }}
        >
          {regionName}
          <ChevronDown style={{ width: 10, height: 10, color: 'var(--m-dim)' }} />
        </button>

        {/* Welcome text */}
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            color: 'var(--m-sub)',
          }}
        >
          Welcome back, <strong style={{ color: 'var(--m-text)', fontWeight: 500 }}>{userName}</strong>
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Bell */}
        <button
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{
            width: 32,
            height: 32,
            border: '1px solid var(--m-border)',
            color: 'var(--m-sub)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--m-bh)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)'; }}
        >
          <Bell style={{ width: 14, height: 14 }} />
        </button>

        {/* Settings */}
        <button
          className="flex items-center justify-center rounded-lg transition-colors"
          style={{
            width: 32,
            height: 32,
            border: '1px solid var(--m-border)',
            color: 'var(--m-sub)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--m-bh)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)'; }}
        >
          <Settings style={{ width: 14, height: 14 }} />
        </button>

        {/* Submit Contributions */}
        <Link
          href={`/member/${slug}/contribute`}
          className="flex items-center rounded-lg px-3.5 py-1.5 transition-opacity hover:opacity-90"
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            fontWeight: 600,
            background: 'var(--m-text)',
            color: 'var(--m-bg)',
          }}
        >
          Submit Contributions
        </Link>
      </div>
    </header>
  );
}
