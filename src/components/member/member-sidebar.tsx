'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  BookOpen,
  Zap,
  Trophy,
  Users,
  FileText,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

interface RegionItem {
  name: string;
  slug: string;
  role: string;
}

interface MemberSidebarProps {
  slug: string;
  regions?: RegionItem[];
}

export function MemberSidebar({ slug, regions = [] }: MemberSidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: BarChart2, label: 'Dashboard', href: `/member/${slug}` },
    { icon: BookOpen, label: 'Guides', href: `/member/${slug}/guides` },
    { icon: Zap, label: 'Quests', href: `/member/${slug}/quests`, badge: '3' },
    { icon: Trophy, label: 'Leaderboard', href: `/member/${slug}/leaderboard` },
    { icon: Users, label: 'Member Directory', href: `/member/${slug}/directory` },
    { icon: FileText, label: 'Proposals', href: `/member/${slug}/proposals` },
    { icon: BookOpen, label: 'Playbooks', href: `/member/${slug}/playbooks`, badge: '!' },
  ];

  const isActive = (href: string) => {
    if (href === `/member/${slug}`) return pathname === href;
    return pathname.startsWith(href);
  };

  const canManage = regions.some(
    (r) => r.role === 'lead' || r.role === 'co_lead',
  );

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 206,
        position: 'sticky',
        top: 64,
        height: 'calc(100vh - 64px)',
        padding: '16px 10px',
      }}
    >
      {/* Navigate Section */}
      <p
        className="mb-2 px-[9px] uppercase"
        style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '2px',
          color: 'var(--m-dim)',
        }}
      >
        Navigate
      </p>

      <nav className="flex flex-col gap-[3px] mb-6">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-[9px] rounded-lg px-[9px] py-[7px] transition-all"
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--m-text)' : 'var(--m-sub)',
                background: active ? 'var(--m-s2)' : 'transparent',
                border: `1px solid ${active ? 'var(--m-border)' : 'transparent'}`,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--m-s2)';
                  e.currentTarget.style.borderColor = 'var(--m-border)';
                  e.currentTarget.style.color = 'var(--m-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = 'var(--m-sub)';
                }
              }}
            >
              <item.icon style={{ width: 14, height: 14, color: active ? 'var(--m-sub)' : 'var(--m-dim)' }} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 9,
                    fontWeight: 600,
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    background: 'var(--m-red-s)',
                    color: 'var(--m-red)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Region Section */}
      {regions.length > 0 && (
        <>
          <p
            className="mb-2 px-[9px] uppercase"
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'var(--m-dim)',
            }}
          >
            Region
          </p>
          <div className="flex flex-col gap-[3px]">
            {regions.map((r) => (
              <div
                key={r.slug}
                className="flex items-center gap-[9px] rounded-lg px-[9px] py-[7px]"
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 13,
                  fontWeight: 400,
                  color: 'var(--m-sub)',
                }}
              >
                <MapPin style={{ width: 14, height: 14, color: 'var(--m-dim)' }} />
                <span className="flex-1">{r.name}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 9,
                    fontWeight: 500,
                    color: 'var(--m-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {r.role}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Admin Dashboard – bottom pinned */}
      {canManage && regions.length > 0 && (
        <Link
          href={`/admin/portal-${regions[0].slug}`}
          className="flex items-center gap-[9px] rounded-lg px-[9px] py-[7px] transition-all mt-2"
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--m-sub)',
            border: '1px solid var(--m-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--m-bh)';
            e.currentTarget.style.color = 'var(--m-text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--m-border)';
            e.currentTarget.style.color = 'var(--m-sub)';
          }}
        >
          <BarChart2 style={{ width: 14, height: 14, color: 'var(--m-dim)' }} />
          <span className="flex-1">Admin Dashboard</span>
          <ArrowRight style={{ width: 10, height: 10, color: 'var(--m-dim)' }} />
        </Link>
      )}
    </aside>
  );
}
