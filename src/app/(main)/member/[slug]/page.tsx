'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { ArrowRight, Search, ChevronDown, Calendar, Users, FileText } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { BentoCard } from '@/components/portal/bento-card';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardData {
  user: {
    totalXp: number;
    level: number;
    displayName: string;
    avatarUrl?: string;
  };
}

interface XpTransaction {
  id: string;
  amount: number;
  sourceType: string;
  description: string | null;
  createdAt: string;
}

interface RegionItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  role: string;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
}

interface MembershipStatus {
  id: string;
  regionId: string;
  regionName: string;
  regionSlug: string;
  regionLogoUrl: string | null;
  role: string;
  status: string;
  isPrimary: boolean;
  appliedAt: string;
  acceptedAt: string | null;
  isActive: boolean;
}

interface GuideData {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  readTime: number | null;
  coverImageUrl: string | null;
}

interface ProgramData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  startDate: string;
  rsvpCount: number;
  coverImageUrl: string | null;
}

const XP_SOURCE_LABELS: Record<string, string> = {
  quest: 'Quest Completed',
  bounty: 'Bounty Approved',
  event: 'Event Attendance',
  badge: 'Badge Earned',
  manual: 'Manual Award',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TABS = [
  { id: 'guide', label: 'GUIDE' },
  { id: 'program', label: 'PROGRAM' },
  { id: 'events', label: 'EVENTS' },
];

// ---------------------------------------------------------------------------
// Region Switcher
// ---------------------------------------------------------------------------

function RegionSwitcher({ memberships, currentSlug }: { memberships: MembershipStatus[]; currentSlug: string }) {
  const [open, setOpen] = useState(false);
  const current = memberships.find(m => m.regionSlug === currentSlug);

  if (memberships.length <= 1) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
        {current?.regionLogoUrl ? (
          <img src={current.regionLogoUrl} alt={current.regionName} className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          </div>
        )}
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{current?.regionName || currentSlug}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
      >
        {current?.regionLogoUrl ? (
          <img src={current.regionLogoUrl} alt={current.regionName} className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          </div>
        )}
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{current?.regionName || currentSlug}</span>
        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 min-w-[220px] rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          {memberships.map(m => (
            <Link
              key={m.id}
              href={`/member/${m.regionSlug}`}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                m.regionSlug === currentSlug
                  ? 'bg-zinc-100 font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              {m.regionLogoUrl ? (
                <img src={m.regionLogoUrl} alt={m.regionName} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <Calendar className="h-3 w-3 text-zinc-500" />
                </div>
              )}
              {m.regionName}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function MemberDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('guide');
  const [questTab, setQuestTab] = useState('MEMBER');
  const [visibilityMode, setVisibilityMode] = useState<'public' | 'member'>('member');
  const [resourceSearch, setResourceSearch] = useState('');

  const QUEST_TABS = ['MEMBER', 'DAILY', 'WEEKLY', 'MONTHLY'];

  // Fetch memberships for the switcher
  const { data: allMemberships } = useApi<MembershipStatus[]>(
    authUser ? '/api/portal/membership/my-status' : '',
    { immediate: !!authUser },
  );

  // Only accepted & active memberships
  const acceptedMemberships = (allMemberships || []).filter(m => m.status === 'accepted' && m.isActive);

  // Membership guard
  useEffect(() => {
    if (authLoading) return;
    if (!authUser || !authUser.isMember) {
      router.replace('/portal');
    }
  }, [authUser, authLoading, router]);

  const { data, loading, error } = useApi<DashboardData>(
    authUser ? '/api/portal/dashboard' : '',
    { immediate: !!authUser },
  );

  const { data: leaderboard } = useApi<LeaderboardUser[]>(
    authUser ? '/api/leaderboard/members?limit=3' : '',
    { immediate: !!authUser },
  );

  const { data: xpHistory } = useApi<XpTransaction[]>(
    authUser ? '/api/portal/xp-history' : '',
    { immediate: !!authUser },
  );

  // Fetch region-scoped content for tabs
  const guidesUrl = authUser ? `/api/portal/guides?region=${slug}&visibility=${visibilityMode}&search=${resourceSearch}` : '';
  const { data: guidesResp, loading: guidesLoading } = useApi<GuideData[]>(guidesUrl, { immediate: !!authUser });

  const programsUrl = authUser ? `/api/portal/programs?region=${slug}&visibility=${visibilityMode}` : '';
  const { data: programsResp, loading: programsLoading } = useApi<ProgramData[]>(programsUrl, { immediate: !!authUser });

  const eventsUrl = authUser ? `/api/portal/events?region=${slug}&visibility=${visibilityMode}&search=${resourceSearch}` : '';
  const { data: eventsResp, loading: eventsLoading } = useApi<EventData[]>(eventsUrl, { immediate: !!authUser });

  const regions: RegionItem[] = (data as any)?.regions || [];

  if (authLoading || loading) return <PageLoader />;
  if (!authUser || !authUser.isMember) return <PageLoader />;

  const user = data?.user || {
    displayName: authUser?.displayName || 'Builder',
    totalXp: 0,
    level: 1,
    avatarUrl: authUser?.avatarUrl || null,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ---------------------------------------------------------------- */}
      {/* 1. Header Row                                                     */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Member Portal
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <RegionSwitcher memberships={acceptedMemberships} currentSlug={slug} />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Welcome back, <span className="font-semibold text-zinc-900 dark:text-zinc-200">{user.displayName}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/contribute"
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-white"
          >
            submit your contributions
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 2. Main Layout Split                                              */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">

          {/* ---------------------------------------------------------------- */}
          {/* Profile Completion Banner                                        */}
          {/* ---------------------------------------------------------------- */}
          <Link href="/profile/edit" className="mb-12 block group">
            <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/5 px-6 py-5 transition-all group-hover:bg-amber-500/10 dark:border-amber-500/20 dark:bg-amber-950/20 dark:group-hover:bg-amber-950/40">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-500">
                  <Users className="h-5 w-5" />
                </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Complete Your Profile</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Please fill in your name, X handle, telegram, and wallet address to complete your profile.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-amber-600 transition-transform group-hover:translate-x-1 dark:text-amber-500">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </Link>

      {/* ---------------------------------------------------------------- */}
      {/* 3. Resource Tabs & Carousel                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-12">
        <div className="mb-6 flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* Visibility Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-card p-1 text-card-foreground dark:border-zinc-800">
              <button
                onClick={() => setVisibilityMode('public')}
                className={`rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  visibilityMode === 'public'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                PUBLIC
              </button>
              <button
                onClick={() => setVisibilityMode('member')}
                className={`rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  visibilityMode === 'member'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                MEMBER
              </button>
            </div>

            {/* Content Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-card p-1 text-card-foreground dark:border-zinc-800">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full min-w-[200px] rounded-lg border border-zinc-200 bg-zinc-50 pl-9 text-sm focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600 sm:w-64"
              />
            </div>

            <button className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-[#1f1f22]">
              <Search className="h-3.5 w-3.5" />
              ALL VIEW
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            <Link
              href="/portal/events"
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-[#1f1f22]"
            >
              SEE ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[120px]">
          {activeTab === 'guide' && (
            guidesLoading ? (
              <div className="flex justify-center py-10"><Spinner size="sm" /></div>
            ) : !guidesResp || guidesResp.length === 0 ? (
              <EmptyState title="No guides yet" description="No guides available for this region." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {guidesResp.map((g) => (
                  <Link key={g.id} href={`/portal/guides/${g.slug}`}>
                    <Card className="h-full hover:border-zinc-600 transition-colors">
                      <CardContent className="p-4">
                        {g.category && (
                          <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{g.category}</span>
                        )}
                        <h3 className="text-sm font-bold text-zinc-100 line-clamp-2">{g.title}</h3>
                        {g.readTime && <p className="mt-2 text-[10px] text-zinc-500">{g.readTime} min read</p>}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )
          )}

          {activeTab === 'program' && (
            programsLoading ? (
              <div className="flex justify-center py-10"><Spinner size="sm" /></div>
            ) : !programsResp || programsResp.length === 0 ? (
              <EmptyState title="No programs yet" description="No programs available for this region." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {programsResp.map((p) => (
                  <Card key={p.id} className="h-full hover:border-zinc-600 transition-colors">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{p.status}</span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-100 line-clamp-2">{p.title}</h3>
                      {p.description && <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{p.description}</p>}
                      {(p.startsAt || p.endsAt) && (
                        <p className="mt-2 text-[10px] text-zinc-500">
                          {p.startsAt && new Date(p.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {p.endsAt && ` — ${new Date(p.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {activeTab === 'events' && (
            eventsLoading ? (
              <div className="flex justify-center py-10"><Spinner size="sm" /></div>
            ) : !eventsResp || eventsResp.length === 0 ? (
              <EmptyState title="No events yet" description="No events available for this region." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {eventsResp.map((e) => (
                  <Card key={e.id} className="h-full hover:border-zinc-600 transition-colors">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{e.type}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          e.status === 'published' ? 'bg-green-900/30 text-green-400' : 'bg-zinc-800 text-zinc-400'
                        }`}>{e.status}</span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-100 line-clamp-2">{e.title}</h3>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-500">
                        <span>{new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>{e.rsvpCount} RSVPs</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* XP History                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-zinc-100">XP History</h2>

        {!xpHistory || xpHistory.length === 0 ? (
          <EmptyState
            title="No XP earned yet"
            description="Complete quests, bounties, and attend events to earn XP."
          />
        ) : (
          <Card>
            <CardContent className="divide-y divide-zinc-800">
              {xpHistory.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200">
                      {XP_SOURCE_LABELS[tx.sourceType] || tx.sourceType}
                    </p>
                    {tx.description && (
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{tx.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount} XP
                    </span>
                    <span className="text-xs text-zinc-600">{formatDate(tx.createdAt)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* My Regions                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-zinc-100">My Regions</h2>

        {regions.length === 0 ? (
          <EmptyState
            title="You haven't joined a region yet"
            description="Regions are local communities where you can attend events, earn XP, and connect with others."
            action={{
              label: 'Join a Region',
              onClick: () => {
                window.location.href = '/portal/membership';
              },
            }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => {
              const canManage = region.role === 'lead' || region.role === 'co_lead';
              return (
                <Card key={region.id} className="hover:border-red-900/50 transition-colors h-full">
                  <CardContent className="p-5">
                    <Link href={`/portal/regions/${region.slug}`} className="flex items-center gap-3 mb-3">
                      {region.logoUrl ? (
                        <img src={region.logoUrl} alt={region.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                          <Calendar className="h-5 w-5 text-zinc-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-zinc-100">{region.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{region.role}</p>
                      </div>
                    </Link>
                    {canManage && (
                      <Link
                        href={`/admin/portal-${region.slug}`}
                        className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Admin Dashboard <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 5. 2-Column Community Links                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-2 mb-16">
        <Link href="/portal/proposals" className="group block">
          <BentoCard className="h-full transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">New Proposals</h3>
                  <p className="text-xs text-zinc-500">Vote on upcoming ideas</p>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-[#FF394A] group-hover:text-white dark:bg-zinc-800/50">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-zinc-200/50 bg-zinc-50/50 p-6 dark:border-zinc-800/50 dark:bg-zinc-900/30">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No active proposals at the moment. Check back later or start a new discussion.
              </p>
            </div>
          </BentoCard>
        </Link>

        <Link href="/portal/members" className="group block">
          <BentoCard className="h-full transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Member Directory</h3>
                  <p className="text-xs text-zinc-500">Connect with the community</p>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors group-hover:bg-[#FF394A] group-hover:text-white dark:bg-zinc-800/50">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-zinc-200/50 bg-zinc-50/50 p-6 dark:border-zinc-800/50 dark:bg-zinc-900/30">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Connect with other builders, mentors, and contributors. Find peers and collaborate on new ideas.
              </p>
            </div>
          </BentoCard>
        </Link>
      </div>

      </div> {/* End left column */}

      {/* ---------------------------------------------------------------- */}
      {/* Right Sidebar                                                     */}
      {/* ---------------------------------------------------------------- */}
      <aside className="w-full lg:w-[360px] shrink-0 space-y-6">

        {/* Profile Stats Widget */}
        <BentoCard className="flex flex-col items-center p-8 text-center bg-card text-card-foreground">
          <div className="relative mb-4">
            <Avatar src={user.avatarUrl} alt={user.displayName} size="xl" className="h-[72px] w-[72px] bg-[#FF394A] text-white ring-2 ring-zinc-800" />
          </div>
          <h3 className="text-xl font-bold text-zinc-100">{user.displayName}</h3>
          <p className="text-sm text-zinc-500 mb-8 font-medium">@{authUser?.username || 'user'}</p>

          <div className="w-full flex items-center justify-between text-xs font-bold text-zinc-400 mb-2">
            <span className="tracking-widest uppercase">LEVEL {user.level}</span>
            <span className="text-[#FF394A]">{user.totalXp} XP</span>
          </div>
          <div className="w-full relative">
            <div className="flex justify-between text-[10px] text-zinc-500 mb-2 font-bold tracking-wider">
              <span>Lv.{user.level}</span>
              <span>Lv.{user.level + 1}</span>
            </div>
            <div className="h-2.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
              <div className="h-full bg-zinc-600 rounded-full transition-all duration-1000" style={{ width: '0%' }} />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 text-center font-bold tracking-wider uppercase">0 / 500 XP</p>
          </div>
        </BentoCard>

        {/* Quests Widget */}
        <BentoCard className="p-7 bg-card text-card-foreground">
          <h3 className="text-[13px] font-black tracking-[0.15em] text-zinc-100 mb-6 uppercase">QUESTS</h3>
          <div className="flex rounded-xl border border-zinc-800/50 bg-black p-1 mb-8 overflow-x-auto scrollbar-hide">
            {QUEST_TABS.map(t => (
              <button
                key={t}
                onClick={() => setQuestTab(t)}
                className={`flex-1 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors min-w-max ${questTab === t ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="py-8 text-center">
            <p className="text-[10px] font-bold tracking-[0.15em] text-zinc-600 uppercase">NO {questTab} QUESTS</p>
          </div>
        </BentoCard>

        {/* Leaderboard Widget */}
        <BentoCard className="p-7 bg-card text-card-foreground">
          <h3 className="text-[13px] font-black tracking-[0.15em] text-zinc-100 mb-6 uppercase">LEADERBOARD</h3>
          <div className="space-y-3 mb-6">
            {leaderboard?.map((u, i) => (
              <Link href={`/profile/${u.id}`} key={u.id} className="flex items-center gap-4 rounded-2xl border border-zinc-800/30 bg-black/40 p-4 hover:bg-zinc-900/50 transition-colors">
                <div className={`text-sm font-black w-4 text-center ${i === 0 ? 'text-[#FF394A]' : 'text-zinc-500'}`}>
                  {i + 1}
                </div>
                <Avatar src={u.avatarUrl} alt={u.displayName} size="md" className="h-10 w-10 bg-[#FF394A] text-white" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-zinc-100 truncate">{u.displayName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-[#FF394A]">{u.totalXp}</p>
                  <p className="text-[10px] font-bold tracking-wider text-zinc-500 mt-1">Lv.{u.level}</p>
                </div>
              </Link>
            ))}
            {(!leaderboard || leaderboard.length === 0) && (
              <p className="text-center text-xs text-zinc-600 py-6 font-medium">No rankings yet.</p>
            )}
          </div>
          <Link href="/portal/leaderboard" className="flex justify-center items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500 hover:text-white transition-colors">
            VIEW ALL <ArrowRight className="h-3 w-3" />
          </Link>
        </BentoCard>

      </aside>

      </div>
    </div>
  );
}
