import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BentoCard } from './bento-card';
import { useAuth } from '@/lib/context/auth-context';

export function DashboardRight() {
  const { user } = useAuth();
  const [questTab, setQuestTab] = useState('DAILY');

  const mockQuests = [
    { id: 1, title: 'Read Avalanche Guide', xp: 50 },
    { id: 2, title: 'Join a Regional Hub', xp: 100 },
    { id: 3, title: 'Verify Wallet Address', xp: 150 },
  ];

  const mockLeaderboard = [
    { id: 1, name: 'Padhang Satrio', role: 'Developer', avatar: null, rank: 1 },
    { id: 2, name: 'Zakir Horizontal', role: 'Designer', avatar: null, rank: 2 },
    { id: 3, name: 'Leonardo Samsul', role: 'Community Lead', avatar: null, rank: 3 },
    { id: 4, name: 'Aria Winters', role: 'Trader', avatar: null, rank: 4 },
    { id: 5, name: 'Marcus Chen', role: 'Developer', avatar: null, rank: 5 },
    { id: 6, name: 'Sophie Laurent', role: 'Designer', avatar: null, rank: 6 },
    { id: 7, name: 'David Kim', role: 'Community Lead', avatar: null, rank: 7 },
    { id: 8, name: 'Elena Rostova', role: 'Developer', avatar: null, rank: 8 },
    { id: 9, name: 'James Wilson', role: 'Trader', avatar: null, rank: 9 },
    { id: 10, name: 'Olivia Martinez', role: 'Designer', avatar: null, rank: 10 },
  ];

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        {/* Not Signed In Profile */}
        <BentoCard className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="mb-1 text-base font-bold text-white">Not signed in</h3>
          <p className="mb-6 text-[13px] text-zinc-500 max-w-[200px]">Sign in to view your profile and track progress.</p>
          <Link href="/auth/login" className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-zinc-200">
            Sign In &rarr;
          </Link>
        </BentoCard>

        {/* Not Signed In Quests */}
        <BentoCard 
          title="Quests" 
          headerRight={
            <svg className="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          className="p-0 overflow-hidden"
        >
          <div className="flex w-full border-b border-zinc-800/60 px-4 pt-4">
            {['DAILY', 'WEEKLY', 'MONTHLY'].map((tab) => (
              <button
                key={tab}
                onClick={() => setQuestTab(tab)}
                className={`flex-1 pb-3 text-[10px] font-bold tracking-wider transition-colors relative ${
                  questTab === tab 
                    ? 'text-white' 
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                {tab}
                {questTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="mb-4 text-[12px] text-zinc-500">Sign in to view and complete quests</p>
            <Link href="/auth/login" className="rounded-lg border border-zinc-800 bg-transparent px-6 py-2 text-[13px] font-medium text-white transition-colors hover:bg-zinc-900 hover:text-white">
              Sign In
            </Link>
          </div>
        </BentoCard>

        {/* Not Signed In Leaderboard */}
        <BentoCard 
          title="Leaderboard" 
          headerRight={
            <svg className="h-4 w-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
          className="p-0 overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="mb-4 text-[12px] text-zinc-500">Sign in to view rankings</p>
            <Link href="/auth/login" className="rounded-lg border border-zinc-800 bg-transparent px-6 py-2 text-[13px] font-medium text-white transition-colors hover:bg-zinc-900 hover:text-white">
              Sign In
            </Link>
          </div>
        </BentoCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Profile Picture, XP, Level */}
      <Card className="flex flex-col items-center justify-center p-6 text-center shadow-sm dark:bg-zinc-950/40 dark:backdrop-blur-xl dark:border-white/5">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-indigo-500 p-1 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500" style={{ clipPath: 'polygon(0 0, 80% 0, 80% 100%, 0% 100%)' }}></div>
          <Avatar src={null} alt="User" size="lg" className="h-20 w-20" />
          <div className="absolute -right-2 -top-2 flex h-7 items-center justify-center rounded-full bg-indigo-600 px-3 text-sm font-bold text-white shadow-sm">
            Lvl 32
          </div>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">Jason Ranti</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">Continue your learning to achieve your target!</p>
        
        <div className="w-full rounded-xl bg-zinc-100 p-4 dark:bg-white/5">
           <span className="block text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1">Total XP</span>
           <span className="block text-3xl font-black text-indigo-600 dark:text-indigo-500">12,450</span>
        </div>
      </Card>

      {/* 2. Quests Section */}
      <div className="mt-2 flex flex-col gap-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Quests</h3>
        <div className="flex w-full rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-white/5 dark:bg-zinc-950/40 dark:backdrop-blur-xl">
          {['Daily', 'Weekly', 'Monthly'].map((tab) => (
            <button
               key={tab}
               onClick={() => setQuestTab(tab)}
               className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${
                 questTab === tab 
                   ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50' 
                   : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
               }`}
             >
               {tab}
             </button>
          ))}
        </div>
        
        <Card className="p-0 overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 shadow-sm dark:bg-zinc-950/40 dark:backdrop-blur-xl dark:border-white/5">
          {mockQuests.map((quest) => (
            <div key={quest.id} className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5">
              <div className="min-w-0 flex-1 pr-4">
                <p className="truncate font-bold text-sm text-zinc-900 dark:text-zinc-50">{quest.title}</p>
                <p className="truncate text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">+{quest.xp} XP</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold rounded-full dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800">Start</Button>
            </div>
          ))}
        </Card>
      </div>

      {/* 3. Leaderboard */}
      <div className="mt-2 flex flex-col gap-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Leaderboard</h3>
        <Card className="p-0 overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 shadow-sm dark:bg-zinc-950/40 dark:backdrop-blur-xl dark:border-white/5">
          <div className="flex bg-zinc-50 dark:bg-transparent border-b border-zinc-200 dark:border-white/5 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <div className="w-8 text-center">Rnk</div>
            <div className="flex-1 pl-2">Member</div>
          </div>
          {mockLeaderboard.map((user) => (
             <div key={user.id} className="flex items-center px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5">
               <div className="w-8 text-center text-sm font-black text-zinc-300 dark:text-zinc-600">#{user.rank}</div>
               <div className="flex flex-1 items-center gap-3 pl-2 overflow-hidden">
                 <Avatar src={user.avatar} alt={user.name} size="sm" />
                 <div className="min-w-0 flex-1">
                   <p className="truncate font-bold text-sm text-zinc-900 dark:text-zinc-50">{user.name}</p>
                   <p className="truncate text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{user.role}</p>
                 </div>
               </div>
             </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
