import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowUpRight, ChevronDown, Filter, FolderArchive, Mail, Search } from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-lg">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-100">Welcome to Portal</p>
          <h2 className="mb-5 text-3xl font-bold sm:text-4xl">Sharpen Your Skills with Professional Online Courses</h2>
          <Button variant="secondary" className="mt-2 text-zinc-900 hover:text-zinc-900 bg-white hover:bg-zinc-100 rounded-full font-semibold border-none py-2 px-6">
            Join Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 right-20 h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl"></div>
      </div>

      {/* 2. Events Widget */}
      <div className="rounded-xl border flex flex-col border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
           <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Upcoming Events</h3>
           <Link href="/portal/events" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">See all →</Link>
        </div>
        <div className="p-5 flex gap-4 overflow-x-auto hide-scrollbar">
           {mockEvents.map((event) => (
             <div key={event.id} className="min-w-[280px] group relative flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50">
                <div className="h-40 w-full bg-zinc-200 dark:bg-zinc-800 object-cover opacity-80 transition-opacity group-hover:opacity-100"></div>
                <div className="absolute top-3 right-3">
                  <span className="rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white backdrop-blur-md">{event.type}</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{event.title}</h4>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* 3. Guides, Programs, Host Side-by-Side Content */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-1 rounded-xl w-fit">
            {['Guides', 'Programs', 'Host'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setContentTab(tab)}
                 className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                   contentTab === tab 
                     ? 'bg-white dark:bg-[#1f1f1f] text-zinc-900 dark:text-white shadow-sm' 
                     : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                 }`}
               >
                 {tab}
               </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input type="text" placeholder="Search..." className="w-full sm:w-48 rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#111111] py-2 pl-9 pr-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors" />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#111111] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Filter className="h-4 w-4" /> All View <ChevronDown className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {contentTab === 'Guides' && mockGuides.map((guide) => (
             <div key={guide.id} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#111111] p-2 hover:border-zinc-300 dark:hover:border-white/10 transition-colors shadow-sm">
                <div className="relative h-48 w-full rounded-xl bg-indigo-100 dark:bg-zinc-800 object-cover flex items-center justify-center">
                  <span className="text-zinc-400 dark:text-zinc-600 text-sm">Image</span>
                </div>
                <div className="p-4 pt-5 gap-2 flex flex-col">
                  <span className="text-[10px] font-bold text-indigo-500 shadow-indigo-500 border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 rounded-md w-fit px-2 py-1 uppercase tracking-wider">{guide.target}</span>
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-white">{guide.title}</h4>
                </div>
             </div>
           ))}
           {contentTab === 'Programs' && mockPrograms.map((program) => (
             <div key={program.id} className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#111111] p-2 hover:border-zinc-300 dark:hover:border-white/10 transition-colors shadow-sm">
                <div className="relative h-48 w-full rounded-xl bg-purple-100 dark:bg-zinc-800 object-cover flex items-center justify-center">
                  <span className="text-zinc-400 dark:text-zinc-600 text-sm">Image</span>
                </div>
                <div className="p-4 pt-5 gap-2 flex flex-col">
                  <span className="text-[10px] font-bold text-purple-500 shadow-purple-500 border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 rounded-md w-fit px-2 py-1 uppercase tracking-wider">{program.target}</span>
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-white">{program.title}</h4>
                </div>
             </div>
           ))}
           {contentTab === 'Host' && (
             <div className="col-span-full border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-sm">
                <span className="block text-4xl mb-4">🎤</span>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Want to Host an Event?</h4>
                <p className="text-zinc-500 text-sm max-w-sm mb-6">Get access to resources, funding, and support to bring your community together.</p>
                <Button>Apply to Host</Button>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-2">
        {/* 4. Verify Member */}
        <Card className="flex flex-col gap-4 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80 rounded-2xl shadow-sm h-full">
          <div className="text-center mb-2 mt-2">
             <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Verify Member</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Email Address</label>
               <input type="email" placeholder="name@example.com" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">X Handle</label>
               <input type="text" placeholder="@username" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Telegram</label>
               <input type="text" placeholder="@username" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Discord</label>
               <input type="text" placeholder="@username" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
            </div>
          </div>
          <Button variant="secondary" className="w-full mt-4 py-6 rounded-xl bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 font-semibold transition-colors">
             Check Status
          </Button>
        </Card>

        {/* 5. Contact and Brandkit */}
        <div className="flex flex-col gap-5 h-full">
          <Card className="flex flex-1 flex-col justify-center p-6 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer shadow-sm rounded-2xl">
             <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
               <Mail className="h-6 w-6" />
             </div>
             <div>
               <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Contact Us</h4>
               <p className="mt-1 text-sm text-zinc-500 line-clamp-2">Reach out for partnerships, events, and press.</p>
               <span className="mt-4 inline-flex items-center text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">View Options <ArrowUpRight className="ml-1 h-4 w-4" /></span>
             </div>
          </Card>
          <Card className="flex flex-1 flex-col justify-center p-6 border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer shadow-sm rounded-2xl">
             <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
               <FolderArchive className="h-6 w-6" />
             </div>
             <div>
               <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Brand Kit</h4>
               <p className="mt-1 text-sm text-zinc-500 line-clamp-2">Download official logos, brand guidelines, and assets.</p>
               <span className="mt-4 inline-flex items-center text-xs font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wide">Open Kit <ArrowUpRight className="ml-1 h-4 w-4" /></span>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
