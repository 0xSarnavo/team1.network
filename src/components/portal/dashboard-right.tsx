import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function DashboardRight() {
  const [questTab, setQuestTab] = useState('Daily');

  const mockQuests = [
    { id: 1, title: 'Read Avalanche Guide', xp: 50 },
    { id: 2, title: 'Join a Regional Hub', xp: 100 },
    { id: 3, title: 'Verify Wallet Address', xp: 150 },
  ];

  const mockLeaderboard = [
    { id: 1, name: 'Padhang Satrio', role: 'Developer', avatar: null, rank: 1 },
    { id: 2, name: 'Zakir Horizontal', role: 'Designer', avatar: null, rank: 2 },
    { id: 3, name: 'Leonardo Samsul', role: 'Community Lead', avatar: null, rank: 3 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Profile Picture, XP, Level */}
      <Card className="flex flex-col items-center justify-center p-6 text-center shadow-sm">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-indigo-500/20 p-1 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500" style={{ clipPath: 'polygon(0 0, 80% 0, 80% 100%, 0% 100%)' }}></div>
          <Avatar src={null} alt="User" size="lg" className="h-20 w-20" />
          <div className="absolute -right-2 -top-2 flex h-7 items-center justify-center rounded-full bg-indigo-500 px-3 text-sm font-bold text-white shadow-sm">
            Lvl 32
          </div>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Jason Ranti</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">Continue your learning to achieve your target!</p>
        
        <div className="w-full rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800/50">
           <span className="block text-xs font-semibold uppercase text-zinc-500 mb-1">Total XP</span>
           <span className="block text-3xl font-black text-indigo-500">12,450</span>
        </div>
      </Card>

      {/* 2. Quests Section */}
      <div className="mt-2 flex flex-col gap-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Quests</h3>
        <div className="flex w-full rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/50">
          {['Daily', 'Weekly', 'Monthly'].map((tab) => (
            <button
               key={tab}
               onClick={() => setQuestTab(tab)}
               className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                 questTab === tab 
                   ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100' 
                   : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
               }`}
             >
               {tab}
             </button>
          ))}
        </div>
        
        <Card className="p-0 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800 shadow-sm">
          {mockQuests.map((quest) => (
            <div key={quest.id} className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <div className="min-w-0 flex-1 pr-4">
                <p className="truncate font-semibold text-sm text-zinc-900 dark:text-zinc-100">{quest.title}</p>
                <p className="truncate text-xs text-indigo-500 font-bold mt-1">+{quest.xp} XP</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">Start</Button>
            </div>
          ))}
        </Card>
      </div>

      {/* 3. Leaderboard */}
      <div className="mt-2 flex flex-col gap-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Leaderboard</h3>
        <Card className="p-0 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800 shadow-sm">
          <div className="flex bg-zinc-50/50 dark:bg-zinc-900 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <div className="w-8 text-center">Rnk</div>
            <div className="flex-1 pl-2">Member</div>
          </div>
          {mockLeaderboard.map((user) => (
             <div key={user.id} className="flex items-center px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
               <div className="w-8 text-center text-sm font-black text-zinc-300 dark:text-zinc-700">#{user.rank}</div>
               <div className="flex flex-1 items-center gap-3 pl-2 overflow-hidden">
                 <Avatar src={user.avatar} alt={user.name} size="sm" />
                 <div className="min-w-0 flex-1">
                   <p className="truncate font-semibold text-sm text-zinc-900 dark:text-zinc-100">{user.name}</p>
                   <p className="truncate text-[10px] text-zinc-500">{user.role}</p>
                 </div>
               </div>
             </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
