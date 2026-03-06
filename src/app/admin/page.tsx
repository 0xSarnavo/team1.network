'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { PageLoader } from '@/components/ui/spinner';
import {
  Bell, Sun, Moon, Plus, Search, ChevronDown, ArrowRight,
  FileText, Megaphone, UserCheck, ClipboardList, Settings2,
  BookOpen, Calendar, Layers, FlaskConical, Image, UserCog,
  Briefcase, Handshake, History,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface AdminStats {
  stats: {
    totalUsers: number; activeUsers: number; totalRegions: number;
    totalMembers: number; pendingMembers: number; totalEvents: number;
    totalQuests: number; totalGuides: number; pendingSubmissions: number;
    totalBounties: number; activeBounties: number; pendingBountySubmissions: number;
    totalXpDistributed: number;
  };
  recentUsers: { id: string; displayName: string; email: string; avatarUrl: string | null; createdAt: string }[];
  regions: { id: string; name: string; slug: string; memberCount: number }[];
}

/* -------------------------------------------------------------------------- */
/* Timezone Strip                                                             */
/* -------------------------------------------------------------------------- */

const ZONES: { label: string; offset: number }[] = [
  { label: 'IST', offset: 330 },
  { label: 'UTC', offset: 0 },
  { label: 'EST', offset: -300 },
  { label: 'PST', offset: -480 },
  { label: 'CET', offset: 60 },
];

function TimezoneStrip() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (offset: number) => {
    const local = now.getTime();
    const localOffset = now.getTimezoneOffset();
    const utc = local + localOffset * 60000;
    const target = new Date(utc + offset * 60000);
    return target.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="flex items-center gap-[5px]">
      {ZONES.map((z) => (
        <div
          key={z.label}
          className="flex flex-col items-center rounded-[5px]"
          style={{
            minWidth: 43, padding: '3px 7px',
            background: 'var(--a-s2)', border: '1px solid var(--a-bd)',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: 7,
            color: 'var(--a-sub)', letterSpacing: '0.4px',
          }}>
            {z.label}
          </span>
          <span style={{
            fontFamily: 'var(--font-geist-mono)', fontSize: 11, fontWeight: 500,
            color: 'var(--a-text)',
          }}>
            {formatTime(z.offset)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Quick Actions                                                              */
/* -------------------------------------------------------------------------- */

const QUICK_ACTIONS = [
  { icon: FileText, label: 'Applications' },
  { icon: Megaphone, label: 'Announcements' },
  { icon: UserCheck, label: 'Attendance' },
  { icon: ClipboardList, label: 'Meeting Notes' },
  { icon: FileText, label: 'Vote / Polls' },
  { icon: Settings2, label: 'Manage Team' },
];

/* -------------------------------------------------------------------------- */
/* Modules                                                                    */
/* -------------------------------------------------------------------------- */

const MODULES = [
  { icon: BookOpen, name: 'Playbooks', desc: 'Structured guides and SOPs', href: '/home/admin' },
  { icon: Calendar, name: 'Events', desc: 'Schedule and manage events', href: '/portal/admin' },
  { icon: Layers, name: 'Programs', desc: 'Cohorts, bootcamps, tracks', href: '/portal/admin' },
  { icon: FileText, name: 'Content', desc: 'Articles, posts, resources', href: '/admin/content' },
  { icon: Settings2, name: 'Operations', desc: 'Internal processes & tools', href: '/admin/operations' },
  { icon: FlaskConical, name: 'Experiment', desc: 'Feature flags & A/B tests', href: '/admin/experiment' },
  { icon: Image, name: 'Media', desc: 'Images, videos, assets', href: '/admin/media' },
  { icon: UserCog, name: 'Members Details', desc: 'Profiles, roles, data', href: '/admin/users' },
  { icon: Briefcase, name: 'Projects', desc: 'Community project directory', href: '/admin/projects' },
  { icon: Handshake, name: 'Partners', desc: 'Partnerships & sponsors', href: '/admin/partners' },
  { icon: Megaphone, name: 'Mediakit', desc: 'Brand assets & press kit', href: '/admin/mediakit' },
  { icon: History, name: 'Logs', desc: 'System and activity logs', href: '/admin/audit' },
];

/* -------------------------------------------------------------------------- */
/* Mock Users (fallback)                                                      */
/* -------------------------------------------------------------------------- */

const MOCK_USERS = [
  { name: 'Sarnavo', email: 'sarnavo@team1.io', region: 'India', role: 'Lead', online: true },
  { name: 'Alex Chen', email: 'alex@team1.io', region: 'US East', role: 'Member', online: true },
  { name: 'Priya Sharma', email: 'priya@team1.io', region: 'India', role: 'Lead', online: false },
  { name: 'Marko V.', email: 'marko@team1.io', region: 'EU', role: 'Member', online: true },
  { name: 'Jin Park', email: 'jin@team1.io', region: 'APAC', role: 'Member', online: false },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error } = useApi<AdminStats>('/api/admin/stats');
  const [userSearch, setUserSearch] = useState('');

  if (loading) return <PageLoader />;

  return (
    <>
      {/* ═══════════════ TOPBAR ═══════════════ */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{
          padding: '11px 18px',
          borderBottom: '1px solid var(--a-bd)',
          background: 'var(--a-s1)',
        }}
      >
        {/* Left: title + subtitle */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-syne)', fontSize: 16, fontWeight: 800,
            letterSpacing: '-0.4px', color: 'var(--a-text)',
          }}>
            Core Terminal
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: 10.5,
            color: 'var(--a-sub)',
          }}>
            Welcome back, <b style={{ color: 'var(--a-text)', fontWeight: 600 }}>{user?.displayName || 'Admin'}</b>.
          </p>
        </div>

        {/* Right: timezone + actions */}
        <div className="flex items-center gap-[8px]">
          <TimezoneStrip />

          {/* Bell */}
          <button
            className="flex items-center justify-center rounded-md"
            style={{
              width: 27, height: 27,
              border: '1px solid var(--a-bd)', background: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--a-bh)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--a-bd)'; }}
          >
            <Bell style={{ width: 12, height: 12, color: 'var(--a-sub)' }} />
          </button>

          {/* Create User */}
          <Link
            href="/admin/users"
            className="flex items-center gap-[5px] rounded-md"
            style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 600,
              background: 'var(--a-red)', color: '#fff',
              padding: '5px 10px', borderRadius: 8,
            }}
          >
            <Plus style={{ width: 11, height: 11 }} />
            Create User
          </Link>
        </div>
      </div>

      {/* ═══════════════ MAIN BODY ═══════════════ */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 18px' }}>
        <div className="flex flex-col" style={{ gap: 15 }}>

          {/* ── Quick Actions ────────────────────────────────── */}
          <div className="a-fu">
            <p style={{
              fontFamily: 'var(--font-syne)', fontSize: 8.5, fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--a-dim)', marginBottom: 7,
            }}>
              ⚡ Quick Actions
            </p>
            <div className="grid grid-cols-6" style={{ gap: 7 }}>
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  className="flex flex-col items-center rounded-lg"
                  style={{
                    background: 'var(--a-s1)', border: '1px solid var(--a-bd)',
                    padding: '11px 8px', gap: 6, borderRadius: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--a-bh)';
                    e.currentTarget.style.background = 'var(--a-s2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--a-bd)';
                    e.currentTarget.style.background = 'var(--a-s1)';
                  }}
                >
                  <qa.icon style={{ width: 13, height: 13, color: 'var(--a-sub)' }} />
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: 9, fontWeight: 500,
                    color: 'var(--a-sub)', textAlign: 'center',
                  }}>
                    {qa.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Modules ──────────────────────────────────────── */}
          <div className="a-fu1">
            <p style={{
              fontFamily: 'var(--font-syne)', fontSize: 8.5, fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--a-dim)', marginBottom: 7,
            }}>
              Modules
            </p>
            <div className="grid grid-cols-4" style={{ gap: 7 }}>
              {MODULES.map((mod) => (
                <Link
                  key={mod.name}
                  href={mod.href}
                  className="flex flex-col rounded-lg"
                  style={{
                    background: 'var(--a-s1)', border: '1px solid var(--a-bd)',
                    padding: '15px 12px 11px', minHeight: 96, borderRadius: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--a-bh)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--a-bd)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <mod.icon style={{ width: 15, height: 15, color: 'var(--a-sub)', marginBottom: 9 }} />
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 600,
                    color: 'var(--a-text)', marginBottom: 3,
                  }}>
                    {mod.name}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: 9,
                    color: 'var(--a-sub)', lineHeight: 1.5,
                  }}>
                    {mod.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Users Table ───────────────────────────────────── */}
          <div className="a-fu2">
            <p style={{
              fontFamily: 'var(--font-syne)', fontSize: 8.5, fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--a-dim)', marginBottom: 7,
            }}>
              Users
            </p>

            {/* Filters */}
            <div className="flex items-center justify-between mb-[8px]">
              <div className="relative">
                <Search
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  style={{ width: 10, height: 10, color: 'var(--a-dim)' }}
                />
                <input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="rounded-md pl-6 pr-2 py-1 outline-none"
                  style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: 11,
                    color: 'var(--a-text)', background: 'var(--a-s1)',
                    border: '1px solid var(--a-bd)', maxWidth: 260,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--a-bh)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--a-bd)'; }}
                />
              </div>
              <div className="flex items-center gap-[5px]">
                <GhostBtn label="Role" />
                <GhostBtn label="Region" />
              </div>
            </div>

            {/* Table */}
            <div
              className="rounded-[7px] overflow-hidden"
              style={{ background: 'var(--a-s1)', border: '1px solid var(--a-bd)' }}
            >
              {/* Header */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: '2fr 1.8fr 1fr 1fr 65px',
                  background: 'var(--a-s2)',
                  padding: '6px 10px',
                }}
              >
                {['NAME', 'EMAIL', 'REGION', 'ROLE', ''].map((h) => (
                  <span
                    key={h || 'action'}
                    style={{
                      fontFamily: 'var(--font-geist-mono)', fontSize: 7.5,
                      color: 'var(--a-dim)', letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {MOCK_USERS.filter((u) =>
                !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()),
              ).map((u, i) => (
                <div
                  key={i}
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: '2fr 1.8fr 1fr 1fr 65px',
                    padding: '7px 10px',
                    borderTop: '1px solid var(--a-bd)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--a-s2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Name + online dot */}
                  <div className="flex items-center gap-[6px]">
                    <div
                      className={u.online ? 'blink-g' : ''}
                      style={{
                        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                        background: u.online ? '#3a8a50' : 'var(--a-dim)',
                      }}
                    />
                    <span style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 500,
                      color: 'var(--a-text)',
                    }}>
                      {u.name}
                    </span>
                  </div>

                  {/* Email */}
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: 11,
                    color: 'var(--a-sub)',
                  }}>
                    {u.email}
                  </span>

                  {/* Region */}
                  <span style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: 11,
                    color: 'var(--a-sub)',
                  }}>
                    {u.region}
                  </span>

                  {/* Role badge */}
                  <div>
                    <span
                      className="inline-block rounded-full"
                      style={{
                        fontFamily: 'var(--font-geist-mono)', fontSize: 8, fontWeight: 600,
                        padding: '1px 6px',
                        ...(u.role === 'Lead'
                          ? { background: 'var(--a-rs)', color: 'var(--a-red)', border: '1px solid var(--a-rb)' }
                          : { background: 'var(--a-s2)', color: 'var(--a-sub)', border: '1px solid var(--a-bd)' }
                        ),
                      }}
                    >
                      {u.role}
                    </span>
                  </div>

                  {/* Action */}
                  <Link
                    href={`/admin/users`}
                    className="flex items-center gap-[4px]"
                    style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: 10,
                      color: 'var(--a-sub)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--a-text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--a-sub)'; }}
                  >
                    View <ArrowRight style={{ width: 8, height: 8 }} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Ghost Button helper                                                        */
/* -------------------------------------------------------------------------- */

function GhostBtn({ label }: { label: string }) {
  return (
    <button
      className="flex items-center gap-[4px] rounded-md"
      style={{
        fontFamily: 'var(--font-dm-sans)', fontSize: 10, fontWeight: 500,
        color: 'var(--a-sub)', border: '1px solid var(--a-bd)',
        padding: '3px 7px', borderRadius: 6,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--a-bh)'; e.currentTarget.style.color = 'var(--a-text)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--a-bd)'; e.currentTarget.style.color = 'var(--a-sub)'; }}
    >
      {label} <ChevronDown style={{ width: 8, height: 8 }} />
    </button>
  );
}
