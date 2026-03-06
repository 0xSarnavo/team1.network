'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { Spinner } from '@/components/ui/spinner';
import { GlanceCard } from '@/components/member/glance-card';
import { PlaybooksHero } from '@/components/member/playbooks-hero';
import {
  Zap,
  BookOpen,
  TrendingUp,
  Users,
  Shield,
  ArrowRight,
  Search,
  ChevronDown,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardData {
  user: { totalXp: number; level: number; displayName: string; avatarUrl?: string };
}

interface GuideData {
  id: string; title: string; slug: string; category: string | null; readTime: number | null;
}
interface ProgramData {
  id: string; title: string; description: string | null; status: string; startsAt: string | null; endsAt: string | null;
}
interface EventData {
  id: string; title: string; slug: string; type: string; status: string; startDate: string; rsvpCount: number;
}

const CONTENT_TABS = [
  { id: 'guide', label: 'GUIDE' },
  { id: 'program', label: 'PROGRAM' },
  { id: 'events', label: 'EVENTS' },
];

// ---------------------------------------------------------------------------
// Main Page – Center Column (sidebars handled by layout.tsx)
// ---------------------------------------------------------------------------

export default function MemberDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('guide');
  const [visibilityMode, setVisibilityMode] = useState<'public' | 'member'>('member');
  const [resourceSearch, setResourceSearch] = useState('');

  const { data } = useApi<DashboardData>(
    authUser ? '/api/portal/dashboard' : '',
    { immediate: !!authUser },
  );

  const user = data?.user || { displayName: authUser?.displayName || 'Builder', totalXp: 0, level: 1 };

  const { data: guidesResp, loading: guidesLoading } = useApi<GuideData[]>(
    authUser ? `/api/portal/guides?region=${slug}&visibility=${visibilityMode}&search=${resourceSearch}` : '',
    { immediate: !!authUser },
  );
  const { data: programsResp, loading: programsLoading } = useApi<ProgramData[]>(
    authUser ? `/api/portal/programs?region=${slug}&visibility=${visibilityMode}` : '',
    { immediate: !!authUser },
  );
  const { data: eventsResp, loading: eventsLoading } = useApi<EventData[]>(
    authUser ? `/api/portal/events?region=${slug}&visibility=${visibilityMode}&search=${resourceSearch}` : '',
    { immediate: !!authUser },
  );

  // Segmented Control button
  const seg = (label: string, isActive: boolean, onClick: () => void) => (
    <button
      key={label}
      onClick={onClick}
      className="rounded-[6px] px-3 py-[6px] transition-colors"
      style={{
        fontFamily: 'var(--font-dm-sans), sans-serif',
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.8px',
        color: isActive ? 'var(--m-text)' : 'var(--m-sub)',
        background: isActive ? 'var(--m-s3)' : 'transparent',
        border: isActive ? '1px solid var(--m-border)' : '1px solid transparent',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">

      {/* ─────────── Glance Strip ─────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] m-fu">
        <GlanceCard icon={Zap} label="Active Quests" value={3} delta="New" delay={0} />
        <GlanceCard icon={BookOpen} label="Playbooks Read" value={12} delta="+2" delay={50} />
        <GlanceCard icon={TrendingUp} label="Level" value={user.level} delta={`${user.totalXp}xp`} delay={100} />
        <GlanceCard icon={Users} label="Members Online" value={28} delta="Now" delay={150} />
      </div>

      {/* ─────────── Profile Completion Banner ─────────── */}
      <Link href="/profile/edit" className="group m-fu1">
        <div
          className="flex items-center gap-[13px] rounded-[11px] transition-colors"
          style={{
            background: 'var(--m-s1)',
            border: '1px solid var(--m-border)',
            padding: '13px 16px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--m-bh)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)'; }}
        >
          <div
            className="flex items-center justify-center shrink-0 rounded-lg"
            style={{ width: 32, height: 32, background: 'var(--m-s2)', border: '1px solid var(--m-border)' }}
          >
            <Shield style={{ width: 14, height: 14, color: 'var(--m-sub)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--m-text)' }}>
              Complete Your Profile
            </p>
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'var(--m-sub)' }}>
              Fill in your X handle, Telegram, and wallet address.
            </p>
          </div>
          <ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" style={{ width: 14, height: 14, color: 'var(--m-dim)' }} />
        </div>
      </Link>

      {/* ─────────── Playbooks Hero ─────────── */}
      <div className="m-fu2">
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: 'var(--font-syne), sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--m-text)' }}>
            Playbooks
          </h2>
          <Link href={`/member/${slug}/playbooks`} className="flex items-center gap-1 transition-colors" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'var(--m-sub)' }}>
            Browse All <ArrowRight style={{ width: 10, height: 10 }} />
          </Link>
        </div>
        <PlaybooksHero slug={slug} />
      </div>

      {/* ─────────── Guides / Programs / Events ─────────── */}
      <div className="m-fu3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg p-[3px]" style={{ background: 'var(--m-s2)', border: '1px solid var(--m-border)' }}>
              {seg('PUBLIC', visibilityMode === 'public', () => setVisibilityMode('public'))}
              {seg('MEMBER', visibilityMode === 'member', () => setVisibilityMode('member'))}
            </div>
            <div className="flex rounded-lg p-[3px]" style={{ background: 'var(--m-s2)', border: '1px solid var(--m-border)' }}>
              {CONTENT_TABS.map((t) => seg(t.label, activeTab === t.id, () => setActiveTab(t.id)))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ width: 12, height: 12, color: 'var(--m-dim)' }} />
              <input
                placeholder="Search..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="rounded-lg pl-7 pr-3 py-1.5 outline-none transition-colors"
                style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'var(--m-text)', background: 'var(--m-s2)', border: '1px solid var(--m-border)', width: 180 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--m-bh)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)'; }}
              />
            </div>
            <button
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors"
              style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, fontWeight: 500, color: 'var(--m-sub)', border: '1px solid var(--m-border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--m-bh)'; e.currentTarget.style.color = 'var(--m-text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)'; e.currentTarget.style.color = 'var(--m-sub)'; }}
            >
              All View <ChevronDown style={{ width: 10, height: 10 }} />
            </button>
          </div>
        </div>

        <div className="min-h-[100px]">
          {activeTab === 'guide' && (
            guidesLoading ? <div className="flex justify-center py-10"><Spinner size="sm" /></div>
            : !guidesResp?.length ? <EmptyBlock text="No guides available for this region." />
            : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {guidesResp.map((g) => (
                  <ContentCard key={g.id} href={`/member/${slug}/guides/${g.slug}`} category={g.category} title={g.title} meta={g.readTime ? `${g.readTime} min read` : undefined} />
                ))}
              </div>
            )
          )}
          {activeTab === 'program' && (
            programsLoading ? <div className="flex justify-center py-10"><Spinner size="sm" /></div>
            : !programsResp?.length ? <EmptyBlock text="No programs available for this region." />
            : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {programsResp.map((p) => (
                  <ContentCard key={p.id} href={`/member/${slug}/programs/${p.id}`} category={p.status} title={p.title} meta={p.description || undefined} />
                ))}
              </div>
            )
          )}
          {activeTab === 'events' && (
            eventsLoading ? <div className="flex justify-center py-10"><Spinner size="sm" /></div>
            : !eventsResp?.length ? <EmptyBlock text="No events available for this region." />
            : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {eventsResp.map((e) => (
                  <ContentCard key={e.id} href={`/member/${slug}/events/${e.id}`} category={e.type} title={e.title} meta={`${new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${e.rsvpCount} RSVPs`} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* ─────────── Bottom Grid: Verify Identity + Member Directory ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 m-fu4">
        <FeatureCard
          href="/profile/edit"
          icon={Shield}
          title="Verify Identity"
          subtitle="Confirm your socials & wallet"
          body="Link your X handle, Telegram, Discord, and wallet address to verify your identity and unlock all features."
        />
        <FeatureCard
          href={`/member/${slug}/directory`}
          icon={Users}
          title="Member Directory"
          subtitle="Connect with the community"
          body="Connect with other builders, mentors, and contributors. Find peers and collaborate."
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-10">
      <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: 'var(--m-dim)' }}>{text}</p>
    </div>
  );
}

function ContentCard({ href, category, title, meta }: { href: string; category: string | null; title: string; meta?: string }) {
  return (
    <Link href={href}>
      <div
        className="rounded-[9px] transition-all"
        style={{ background: 'var(--m-s1)', border: '1px solid var(--m-border)', padding: 13 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--m-bh)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {category && (
          <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 9, color: 'var(--m-dim)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>{category}</span>
        )}
        <p className="mt-1 line-clamp-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--m-text)' }}>{title}</p>
        {meta && <p className="mt-1.5 line-clamp-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'var(--m-sub)' }}>{meta}</p>}
      </div>
    </Link>
  );
}

function FeatureCard({ href, icon: Icon, title, subtitle, body }: { href: string; icon: React.ElementType; title: string; subtitle: string; body: string }) {
  return (
    <Link href={href} className="group">
      <div
        className="rounded-[10px] overflow-hidden transition-colors"
        style={{ background: 'var(--m-s1)', border: '1px solid var(--m-border)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--m-bh)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)'; }}
      >
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--m-border)' }}>
          <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 28, height: 28, background: 'var(--m-s2)' }}>
            <Icon style={{ width: 13, height: 13, color: 'var(--m-sub)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--m-text)' }}>{title}</p>
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 10, color: 'var(--m-sub)' }}>{subtitle}</p>
          </div>
          <ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" style={{ width: 12, height: 12, color: 'var(--m-dim)' }} />
        </div>
        <div className="px-4 py-3">
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'var(--m-sub)', lineHeight: 1.6 }}>{body}</p>
        </div>
      </div>
    </Link>
  );
}
