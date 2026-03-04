import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Filter, FolderArchive, Mail, Search } from 'lucide-react';
import Link from 'next/link';

export function DashboardLeft() {
  const [contentTab, setContentTab] = useState('Guides'); // Guides, Programs, Host

  const mockEvents = [
    { id: 1, title: '[Apply] Campus Connect', type: 'MEMBER', image: null },
    { id: 2, title: 'Developer Workshop', type: 'PUBLIC', image: null },
    { id: 3, title: 'Annual Summit 2026', type: 'PUBLIC', image: null },
  ];

  const mockGuides = [
    { id: 1, title: 'Beginner\'s Guide to Smart Contracts', target: 'Developers' },
    { id: 2, title: 'How to Host an Event', target: 'Community Leads' },
  ];

  const mockPrograms = [
    { id: 1, title: 'Ambassador Program Cohort 3', target: 'Community' },
    { id: 2, title: 'Builder Grants', target: 'Developers' },
  ];

  const mockHosts = [
    { id: 1, title: 'Host a Regional Hackathon', target: 'Organizers' },
    { id: 2, title: 'Run a Developer Workshop', target: 'Community Leads' },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">Public Directory</h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Access our curated collection of guides, playbooks, and community resources. Built for transparency and collaboration.
          </p>
        </div>
        <InteractiveHoverButton 
          text="Join Now" 
          className="shrink-0 z-10 relative bg-white text-zinc-900 border-white hover:text-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50" 
        />
      </div>

      {/* 2. Events Widget */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 px-1">Upcoming Events</h3>

           <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
               <input type="text" placeholder="Search events..." className="w-full sm:w-48 rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#111111] py-2 pl-9 pr-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors" />
             </div>
             <button className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#111111] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
               <Filter className="h-4 w-4" /> Filter <ChevronDown className="h-3 w-3 ml-1" />
             </button>
             <div className="flex items-center gap-2 ml-2">
               <button className="flex items-center justify-center rounded-xl h-9 w-9 border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#111111] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                 <ChevronLeft className="h-5 w-5" />
               </button>
               <button className="flex items-center justify-center rounded-xl h-9 w-9 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                 <ChevronRight className="h-5 w-5" />
               </button>
             </div>
           </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
           {mockEvents.map((event) => (
             <div key={event.id} className="min-w-[280px] group flex flex-col flex-shrink-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm">
                <div className="relative h-40 w-full rounded-xl bg-orange-100 dark:bg-zinc-800 object-cover flex items-center justify-center">
                  <span className="text-zinc-400 dark:text-zinc-600 text-sm">Image</span>
                </div>
                <div className="p-4 pt-5 gap-2 flex flex-col">
                  <span className={`text-[10px] font-bold ${
                    event.type === 'MEMBER' 
                      ? 'text-amber-600 dark:text-amber-500 border-amber-500 bg-amber-50 dark:bg-zinc-900' 
                      : 'text-cyan-600 dark:text-cyan-500 border-cyan-500 bg-cyan-50 dark:bg-zinc-900'
                  } border rounded-md w-fit px-2 py-1 uppercase tracking-wider`}>
                    {event.type}
                  </span>
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{event.title}</h4>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* 3. Guides, Programs, Host Side-by-Side Content */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl w-fit">
            {['Guides', 'Programs', 'Host'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setContentTab(tab)}
                 className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                   contentTab === tab 
                     ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                     : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'
                 }`}
               >
                 {tab}
               </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
               <input type="text" placeholder="Search..." className="w-full sm:w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 pl-9 pr-3 text-sm text-zinc-900 dark:text-zinc-50 outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors" />
             </div>
             <button className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
               <Filter className="h-4 w-4" /> All View <ChevronDown className="h-3 w-3 ml-1" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {contentTab === 'Guides' && mockGuides.map((guide) => (
             <div key={guide.id} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm">
                <div className="relative h-48 w-full rounded-xl bg-indigo-100 dark:bg-zinc-900 object-cover flex items-center justify-center">
                  <span className="text-zinc-400 dark:text-zinc-600 text-sm">Image</span>
                </div>
                <div className="p-4 pt-5 gap-2 flex flex-col">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500 bg-indigo-50 dark:bg-zinc-900 rounded-md w-fit px-2 py-1 uppercase tracking-wider">{guide.target}</span>
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{guide.title}</h4>
                </div>
             </div>
           ))}
           {contentTab === 'Programs' && mockPrograms.map((program) => (
             <div key={program.id} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm">
                <div className="relative h-48 w-full rounded-xl bg-purple-100 dark:bg-zinc-900 object-cover flex items-center justify-center">
                  <span className="text-zinc-400 dark:text-zinc-600 text-sm">Image</span>
                </div>
                <div className="p-4 pt-5 gap-2 flex flex-col">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500 bg-purple-50 dark:bg-zinc-900 rounded-md w-fit px-2 py-1 uppercase tracking-wider">{program.target}</span>
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{program.title}</h4>
                </div>
             </div>
           ))}
           {contentTab === 'Host' && mockHosts.map((hostData) => (
             <div key={hostData.id} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm">
                <div className="relative h-48 w-full rounded-xl bg-emerald-100 dark:bg-zinc-900 object-cover flex items-center justify-center">
                  <span className="text-zinc-400 dark:text-zinc-600 text-sm">Image</span>
                </div>
                <div className="p-4 pt-5 gap-2 flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500 bg-emerald-50 dark:bg-zinc-900 rounded-md w-fit px-2 py-1 uppercase tracking-wider">{hostData.target}</span>
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{hostData.title}</h4>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 mt-2">
        {/* 4. Verify Member */}
        <Card className="flex flex-col gap-4 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 rounded-2xl shadow-sm h-full w-full">
          <div className="text-center mb-2 mt-2">
             <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Verify Member</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Email Address</label>
               <input type="email" placeholder="name@example.com" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">X Handle</label>
               <input type="text" placeholder="@username" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Telegram</label>
               <input type="text" placeholder="@username" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Discord</label>
               <input type="text" placeholder="@username" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50" />
            </div>
          </div>
          <Button className="w-full mt-4 py-6 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition-colors">
             Check Status
          </Button>
        </Card>

        {/* 5. Contact and Brandkit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
          <Card className="flex flex-1 flex-col justify-center p-6 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer shadow-sm rounded-2xl">
             <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-zinc-900 border border-indigo-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400">
               <Mail className="h-6 w-6" />
             </div>
             <div>
               <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Contact Us</h4>
               <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">Reach out for partnerships, events, and press.</p>
               <span className="mt-4 inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">View Options <ArrowUpRight className="ml-1 h-4 w-4" /></span>
             </div>
          </Card>
          <Card className="flex flex-1 flex-col justify-center p-6 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer shadow-sm rounded-2xl">
             <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-zinc-900 border border-purple-200 dark:border-zinc-800 text-purple-600 dark:text-purple-400">
               <FolderArchive className="h-6 w-6" />
             </div>
             <div>
               <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Brand Kit</h4>
               <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">Download official logos, brand guidelines, and assets.</p>
               <span className="mt-4 inline-flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Open Kit <ArrowUpRight className="ml-1 h-4 w-4" /></span>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
