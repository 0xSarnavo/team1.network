'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import {
  BarChart2, Users, ClipboardList, Shield, UserCog, Settings,
  BookOpen, Calendar, Layers, FileText, Settings2, FlaskConical,
  Image, Briefcase, Handshake, Megaphone, History,
  ChevronDown, LogOut, Sun, Moon,
} from 'lucide-react';

interface NavItem { icon: React.ElementType; label: string; href: string; badge?: string }
interface NavGroup { label: string; items: NavItem[]; defaultOpen: boolean }

export function AdminSidebar({ dark: darkProp, onToggleTheme: onToggleProp }: { dark?: boolean; onToggleTheme?: () => void } = {}) {
  const [internalDark, setInternalDark] = useState(true);
  const dark = darkProp ?? internalDark;
  const onToggleTheme = onToggleProp ?? (() => setInternalDark((d) => !d));
  const pathname = usePathname();
  const { hasModuleLead, isSuperAdmin } = useAuth();

  const groups: NavGroup[] = [
    {
      label: 'Admin Hub',
      defaultOpen: true,
      items: [
        { icon: BarChart2, label: 'Dashboard', href: '/admin' },
        { icon: Users, label: 'Users', href: '/admin/users', badge: '5' },
        { icon: ClipboardList, label: 'Audit Log', href: '/admin/audit' },
        { icon: Shield, label: 'Module Leads', href: '/admin/leads' },
        { icon: UserCog, label: 'Super Admins', href: '/admin/super-admins' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
      ],
    },
    {
      label: 'Modules',
      defaultOpen: true,
      items: [
        { icon: BookOpen, label: 'Playbooks', href: '/admin/playbooks' },
        { icon: Calendar, label: 'Events', href: '/admin/events' },
        { icon: Layers, label: 'Programs', href: '/admin/programs' },
        { icon: FileText, label: 'Content', href: '/admin/content' },
        { icon: Settings2, label: 'Operations', href: '/admin/operations' },
        { icon: FlaskConical, label: 'Experiment', href: '/admin/experiment' },
        { icon: Image, label: 'Media', href: '/admin/media' },
        { icon: UserCog, label: 'Members Details', href: '/admin/members-details' },
        { icon: Briefcase, label: 'Projects', href: '/admin/projects' },
        { icon: Handshake, label: 'Partners', href: '/admin/partners' },
        { icon: Megaphone, label: 'Mediakit', href: '/admin/mediakit' },
        { icon: History, label: 'Logs', href: '/admin/logs' },
      ],
    },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(groups.map((g) => [g.label, g.defaultOpen])),
  );

  const toggle = (label: string) => setOpenGroups((p) => ({ ...p, [label]: !p[label] }));

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width: 214,
        background: 'var(--a-s1)',
        borderRight: '1px solid var(--a-bd)',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* ── Brand Header ──────────────────────────────────────── */}
      <div style={{ padding: '15px 13px 11px', borderBottom: '1px solid var(--a-bd)' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: 'var(--font-syne)', fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px' }}>
            <span style={{ color: 'var(--a-red)' }}>team1</span>
            <span style={{ color: 'var(--a-text)' }}> admin</span>
          </span>
          <span
            style={{
              fontFamily: 'var(--font-geist-mono)', fontSize: 7, fontWeight: 500,
              letterSpacing: '0.8px', padding: '1px 4px',
              background: 'var(--a-s2)', border: '1px solid var(--a-bd)',
              borderRadius: 3, color: 'var(--a-sub)',
            }}
          >
            ADMIN
          </span>
        </div>
      </div>

      {/* ── Scrollable Nav Body ────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: '10px 9px' }}>
        {groups.map((group) => {
          const isOpen = openGroups[group.label];
          return (
            <div key={group.label} className="mb-3">
              {/* Group Header */}
              <button
                onClick={() => toggle(group.label)}
                className="flex w-full items-center justify-between cursor-pointer select-none mb-1"
                style={{ padding: '2px 8px' }}
                onMouseEnter={(e) => { (e.currentTarget.querySelector('.gh') as HTMLElement).style.color = 'var(--a-sub)'; }}
                onMouseLeave={(e) => { (e.currentTarget.querySelector('.gh') as HTMLElement).style.color = 'var(--a-dim)'; }}
              >
                <span
                  className="gh"
                  style={{
                    fontFamily: 'var(--font-syne)', fontSize: 8, fontWeight: 700,
                    letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--a-dim)',
                  }}
                >
                  {group.label}
                </span>
                <ChevronDown
                  style={{
                    width: 8, height: 8, color: 'var(--a-dim)',
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.16s',
                  }}
                />
              </button>

              {/* Items */}
              {isOpen && (
                <div className="flex flex-col gap-[2px]">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="relative flex items-center gap-[7px] rounded-md"
                        style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: 11.5,
                          fontWeight: active ? 500 : 400,
                          color: active ? 'var(--a-text)' : 'var(--a-sub)',
                          background: active ? 'var(--a-s2)' : 'transparent',
                          border: active ? '1px solid var(--a-bd)' : '1px solid transparent',
                          padding: '6px 8px', borderRadius: 6,
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = 'var(--a-s2)';
                            e.currentTarget.style.borderColor = 'var(--a-bd)';
                            e.currentTarget.style.color = 'var(--a-text)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.color = 'var(--a-sub)';
                          }
                        }}
                      >
                        {/* Red active indicator */}
                        {active && (
                          <div
                            className="absolute"
                            style={{
                              left: -9, top: '50%', transform: 'translateY(-50%)',
                              width: 3, height: 13, borderRadius: 2,
                              background: 'var(--a-red)',
                            }}
                          />
                        )}
                        <item.icon style={{ width: 12, height: 12, flexShrink: 0, color: active ? 'var(--a-sub)' : 'var(--a-dim)' }} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span style={{
                            fontFamily: 'var(--font-geist-mono)', fontSize: 8, fontWeight: 600,
                            background: 'var(--a-rs)', color: 'var(--a-red)',
                            borderRadius: 100, padding: '1px 5px',
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Sticky Footer ─────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--a-bd)', padding: '8px 9px' }} className="flex flex-col gap-[3px] shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-[7px] w-full rounded-md transition-colors"
          style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: 11.5,
            color: 'var(--a-sub)', padding: '6px 8px',
            border: '1px solid transparent', borderRadius: 6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--a-s2)'; e.currentTarget.style.borderColor = 'var(--a-bd)'; e.currentTarget.style.color = 'var(--a-text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--a-sub)'; }}
        >
          {dark ? <Sun style={{ width: 12, height: 12 }} /> : <Moon style={{ width: 12, height: 12 }} />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Exit Admin */}
        <Link
          href="/"
          className="flex items-center gap-[7px] w-full rounded-md"
          style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: 11.5,
            color: 'var(--a-sub)', padding: '6px 8px',
            border: '1px solid transparent', borderRadius: 6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--a-rb)'; e.currentTarget.style.color = 'var(--a-red)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--a-sub)'; }}
        >
          <LogOut style={{ width: 12, height: 12 }} />
          <span>Exit Admin</span>
        </Link>
      </div>
    </aside>
  );
}
