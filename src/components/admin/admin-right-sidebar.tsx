'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Zap, AlertCircle, Info, CheckCircle2, LogOut, ArrowRight,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface AdminStats {
  totalUsers: number;
  totalRegions: number;
  activeOnline: number;
  totalQuests: number;
  dailyQuests: number;
  weeklyQuests: number;
  monthlyQuests: number;
}

interface PendingAction {
  severity: 'e' | 'w' | 'g' | 'info';
  icon: React.ElementType;
  iconColor: string;
  text: React.ReactNode;
  time: string;
  btn: string | null;
}

/* -------------------------------------------------------------------------- */
/* Animated Counter                                                           */
/* -------------------------------------------------------------------------- */

function CountUp({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(true);

  useEffect(() => {
    ref.current = true;
    const timeout = setTimeout(() => {
      const duration = 400;
      const start = performance.now();
      const tick = (now: number) => {
        if (!ref.current) return;
        const progress = Math.min((now - start) / duration, 1);
        setDisplay(Math.round(progress * value));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => { ref.current = false; clearTimeout(timeout); };
  }, [value, delay]);

  return <>{display}</>;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function AdminRightSidebar({ stats }: { stats?: AdminStats }) {
  const s = stats || {
    totalUsers: 142, totalRegions: 12, activeOnline: 28, totalQuests: 37,
    dailyQuests: 8, weeklyQuests: 14, monthlyQuests: 15,
  };

  const pendingActions: PendingAction[] = [
    {
      severity: 'e', icon: AlertCircle, iconColor: '#d93030',
      text: <><b>4 applications</b> awaiting review</>,
      time: 'just now', btn: 'Review',
    },
    {
      severity: 'w', icon: AlertCircle, iconColor: '#c87a28',
      text: <><b>Module Leads</b> list needs updating</>,
      time: '2h ago', btn: 'Edit',
    },
    {
      severity: 'info', icon: Info, iconColor: 'var(--a-sub)',
      text: <><b>3 regions</b> have no active lead assigned</>,
      time: '1d ago', btn: 'Assign',
    },
    {
      severity: 'g', icon: CheckCircle2, iconColor: '#2d8a50',
      text: <>Playbooks sync completed successfully</>,
      time: '5h ago', btn: null,
    },
  ];

  const severityMap: Record<string, { bg: string; border: string }> = {
    e:    { bg: 'var(--a-rs)', border: 'var(--a-rb)' },
    w:    { bg: 'var(--a-ws)', border: 'var(--a-wb)' },
    g:    { bg: 'var(--a-gs)', border: 'var(--a-gb)' },
    info: { bg: 'var(--a-s2)', border: 'var(--a-bd)' },
  };

  const questRows = [
    { label: 'Daily Quests', value: s.dailyQuests },
    { label: 'Weekly Quests', value: s.weeklyQuests },
    { label: 'Monthly Quests', value: s.monthlyQuests },
  ];

  const topStats = [
    { label: 'Total Users', value: s.totalUsers },
    { label: 'Regions', value: s.totalRegions },
    { label: 'Active Online', value: s.activeOnline },
    { label: 'Total Quests', value: s.totalQuests },
  ];

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width: 240,
        background: 'var(--a-s1)',
        borderLeft: '1px solid var(--a-bd)',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '13px 11px' }}>
        <div className="flex flex-col" style={{ gap: 11 }}>

          {/* ── QUICK STATS ─────────────────────────────────── */}
          <div className="a-fu">
            <p style={{
              fontFamily: 'var(--font-syne)', fontSize: 8, fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--a-dim)', marginBottom: 7,
            }}>
              Quick Stats
            </p>

            {/* 2×2 Grid */}
            <div className="grid grid-cols-2" style={{ gap: 6 }}>
              {topStats.map((st, i) => (
                <div
                  key={st.label}
                  className="rounded-[7px]"
                  style={{
                    background: 'var(--a-s2)', border: '1px solid var(--a-bd)',
                    padding: '9px 10px',
                  }}
                >
                  <p className="a-count" style={{
                    fontFamily: 'var(--font-geist-mono)', fontSize: 18, fontWeight: 500,
                    color: 'var(--a-text)', lineHeight: 1.2,
                  }}>
                    <CountUp value={st.value} delay={i * 60} />
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: 9,
                    color: 'var(--a-sub)', marginTop: 2,
                  }}>
                    {st.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Quest Breakdown */}
            <div className="flex flex-col" style={{ gap: 5, marginTop: 6 }}>
              {questRows.map((q) => (
                <div
                  key={q.label}
                  className="flex items-center justify-between rounded-md"
                  style={{
                    background: 'var(--a-s2)', border: '1px solid var(--a-bd)',
                    padding: '6px 9px', borderRadius: 6,
                  }}
                >
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <Zap style={{ width: 9, height: 9, color: 'var(--a-sub)' }} />
                    <span style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: 10,
                      color: 'var(--a-sub)',
                    }}>
                      {q.label}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-geist-mono)', fontSize: 12, fontWeight: 500,
                    color: 'var(--a-text)',
                  }}>
                    {q.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--a-bd)' }} />

          {/* ── PENDING ACTIONS ─────────────────────────────── */}
          <div className="a-fu1">
            <p style={{
              fontFamily: 'var(--font-syne)', fontSize: 8, fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--a-dim)', marginBottom: 7,
            }}>
              Pending Actions
            </p>

            <div className="flex flex-col" style={{ gap: 5 }}>
              {pendingActions.map((pa, i) => {
                const sev = severityMap[pa.severity];
                const Icon = pa.icon;
                return (
                  <div
                    key={i}
                    className="flex rounded-[7px]"
                    style={{
                      padding: '8px 9px', gap: 7, alignItems: 'flex-start',
                      background: sev.bg, border: `1px solid ${sev.border}`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--a-bh)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = sev.border; }}
                  >
                    <Icon style={{ width: 11, height: 11, color: pa.iconColor, flexShrink: 0, marginTop: 1 }} />
                    <div className="flex-1 min-w-0">
                      <p style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: 10,
                        color: 'var(--a-sub)', lineHeight: 1.5,
                      }}>
                        {pa.text}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-geist-mono)', fontSize: 8,
                        color: 'var(--a-dim)', marginTop: 2,
                      }}>
                        {pa.time}
                      </p>
                    </div>
                    {pa.btn && (
                      <button
                        className="shrink-0 rounded"
                        style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: 9, fontWeight: 500,
                          color: 'var(--a-sub)', border: '1px solid var(--a-bd)',
                          padding: '2px 6px', borderRadius: 4,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--a-bh)'; e.currentTarget.style.color = 'var(--a-text)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--a-bd)'; e.currentTarget.style.color = 'var(--a-sub)'; }}
                      >
                        {pa.btn}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--a-bd)', padding: '8px 11px' }} className="shrink-0">
        <Link
          href="/"
          className="flex items-center w-full rounded-md"
          style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: 11,
            color: 'var(--a-sub)', padding: '6px 8px', gap: 7,
            border: '1px solid var(--a-bd)', borderRadius: 6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--a-rb)'; e.currentTarget.style.color = 'var(--a-red)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--a-bd)'; e.currentTarget.style.color = 'var(--a-sub)'; }}
        >
          <LogOut style={{ width: 12, height: 12 }} />
          <span className="flex-1">Exit Admin</span>
          <ArrowRight style={{ width: 9, height: 9, color: 'var(--a-dim)' }} />
        </Link>
      </div>
    </aside>
  );
}
