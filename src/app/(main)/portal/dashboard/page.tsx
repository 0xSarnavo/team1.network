'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Settings, LogOut, ArrowRight, Search, ChevronDown, Calendar, Users, FileText } from 'lucide-react';
import { BentoCard } from '@/components/portal/bento-card';
import { HorizontalCarousel } from '@/components/portal/horizontal-carousel';

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

interface DashboardData {
  user: {
    totalXp: number;
    level: number;
    displayName: string;
    avatarUrl?: string;
  };
}

interface EventItem {
  id: string;
  title: string;
  type: string;
  description: string;
  image?: string;
  badge?: string;
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

// Dummy data for the new layout format
const DUMMY_EVENTS: EventItem[] = [
  {
    id: '1',
    title: 'Team1 India Workshop Guide',
    type: 'PUBLIC',
    description: 'Build on Avalanche \u2014 from wallet setup to deploying your own L1 chain.',
    badge: 'PUBLIC',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  },
  {
    id: '2',
    title: '[Apply] City Connect',
    type: 'MEMBER',
    description: 'City Connect events bring together independent builders, founders, creators, and ecosystem...',
    badge: 'MEMBER',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80',
  },
  {
    id: '3',
    title: '[Apply] Campus Connect',
    type: 'MEMBER',
    description: 'Campus Connect events are structured entry-point engagements designed to introduce Avalanche and...',
    badge: 'MEMBER',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
  },
];

const TABS = [
  { id: 'guild', label: 'GUILD' },
  { id: 'program', label: 'PROGRAM' },
  { id: 'host', label: 'HOST' },
];

export default function DashboardPage() {
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('guild');
  const [questTab, setQuestTab] = useState('MEMBER');
  const [visibilityMode, setVisibilityMode] = useState<'public' | 'member'>('member');
  const [resourceSearch, setResourceSearch] = useState('');

  const QUEST_TABS = ['MEMBER', 'DAILY', 'WEEKLY', 'MONTHLY'];

  const { data, loading, error } = useApi<DashboardData>(
    authUser ? '/api/portal/dashboard' : '',
    { immediate: !!authUser },
  );

  const { data: leaderboard } = useApi<LeaderboardUser[]>(
    authUser ? '/api/leaderboard/members?limit=3' : '',
    { immediate: !!authUser },
  );

  if (loading) return <PageLoader />;

  // Display placeholders if auth fails gracefully
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
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Member Portal
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back, <span className="font-semibold text-zinc-900 dark:text-zinc-200">{user.displayName}</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/portal/contribute"
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-white"
          >
            submit your contributions
          </Link>
          
          <Link href="/profile" className="shrink-0 transition-transform hover:scale-105">
            <Avatar src={user.avatarUrl} alt={user.displayName} size="md" className="h-10 w-10 ring-2 ring-zinc-200 dark:ring-zinc-800" />
          </Link>
          
          <Link
            href="/profile/settings/general"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Settings className="h-4 w-4" />
          </Link>
          
          <button
            onClick={logout}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <LogOut className="h-4 w-4" />
          </button>
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
            <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-card p-1 text-card-foreground dark:border-zinc-800">
              <button
                onClick={() => setVisibilityMode('public')}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  visibilityMode === 'public'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                PUBLIC
              </button>
              <button
                onClick={() => setVisibilityMode('member')}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  visibilityMode === 'member'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                MEMBER
              </button>
            </div>

            {/* Content Tabs */}
            <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-card p-1 text-card-foreground dark:border-zinc-800">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
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
                className="w-full bg-card min-w-[200px] rounded-xl border-zinc-200 pl-9 text-sm focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600 sm:w-64"
              />
            </div>
            
            <button className="flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-card px-4 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900">
              <Search className="h-3.5 w-3.5" />
              ALL VIEW
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            
            <Link
              href="/portal/events"
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-card px-5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              SEE ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Horizontal Carousel for Events */}
        {activeTab === 'events' && (
          <HorizontalCarousel>
            {DUMMY_EVENTS.map((event) => (
              <div key={event.id} className="w-[340px] shrink-0 sm:w-[400px]">
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-card text-card-foreground transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700">
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center opacity-20">
                        <Calendar className="h-12 w-12" />
                      </div>
                    )}
                    {/* Badge Overlay */}
                    {event.badge && (
                      <div className="absolute right-3 top-3 rounded bg-zinc-900/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                        {event.badge}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">{event.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </HorizontalCarousel>
        )}
        {activeTab !== 'events' && (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-card text-card-foreground dark:border-zinc-800">
            <p className="text-sm text-zinc-500">No {activeTab} available.</p>
          </div>
        )}
      </div>

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
        <BentoCard className="flex flex-col items-center p-8 text-center bg-[#09090b] text-white">
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
        <BentoCard className="p-7 bg-[#09090b] text-white">
          <h3 className="text-[13px] font-black tracking-[0.15em] text-zinc-100 mb-6 uppercase">QUESTS</h3>
          <div className="flex rounded-full border border-zinc-800/50 bg-black p-1 mb-8 overflow-x-auto scrollbar-hide">
            {QUEST_TABS.map(t => (
              <button 
                key={t}
                onClick={() => setQuestTab(t)}
                className={`flex-1 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors min-w-max ${questTab === t ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
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
        <BentoCard className="p-7 bg-[#09090b] text-white">
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
