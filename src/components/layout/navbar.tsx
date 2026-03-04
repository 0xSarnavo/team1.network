'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { RegionFilterDropdown } from '@/components/portal/region-filter-dropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrantTab } from '@/components/grants/grant-tab-context';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/portal', label: 'Portal' },
  { href: '/grants', label: 'Grants' },
  { href: '/bounty', label: 'Bounty' },
  { href: '/ecosystem', label: 'Cascade' },
  { href: '/member', label: 'Member', requiresAuth: true },
];

export function Navbar() {
  const { user, loading, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const isPortal = pathname.startsWith('/portal');
  const isGrantDetail = pathname === '/grants/minigrants';
  const grantTab = useGrantTab();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-4 mt-2">
      <nav className="flex w-full items-center justify-between pointer-events-auto">
        {/* Left side: Hamburger + Back button (conditional, right of menu) */}
        <div className="flex items-center justify-start gap-2">
          <button 
            className={`group flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-zinc-900 transition-all duration-300 hover:bg-zinc-900 hover:text-white dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 focus:outline-none dark:hover:bg-white dark:hover:text-black ${menuOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`} 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
          {isGrantDetail && (
            <button
              onClick={() => router.push('/grants')}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-zinc-900 transition-all duration-300 hover:bg-zinc-900 hover:text-white dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 focus:outline-none dark:hover:bg-white dark:hover:text-black"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center justify-end gap-3 z-50">
          {/* Grant detail page tabs */}
          {isGrantDetail && grantTab && (
            <div className="hidden sm:flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-0.5">
              {(['details', 'discover', 'faq', 'submissions'] as const).map((tab) => {
                if (tab === 'submissions' && !user) return null;
                const labels: Record<string, string> = { discover: 'Discover', details: 'Details', submissions: 'My Submissions', faq: 'FAQ' };
                return (
                  <button
                    key={tab}
                    onClick={() => grantTab.setActiveTab(tab)}
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
                      grantTab.activeTab === tab
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          )}
          {isPortal && <RegionFilterDropdown />}
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 shadow-lg dark:bg-zinc-800" />
          ) : user ? (
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 p-[2px] transition-transform hover:scale-105">
                <Avatar src={user.avatarUrl} alt={user.displayName} size="sm" className="h-full w-full" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-zinc-200 bg-white py-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
                      <p className="font-medium text-zinc-900 dark:text-zinc-200">{user.displayName}</p>
                      <p className="text-xs text-zinc-500">Level {user.level} &middot; {user.totalXp} XP</p>
                    </div>
                    <Link href="/portal/dashboard" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" onClick={() => setProfileOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href={`/profile/${user.username || user.id}`} className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" onClick={() => setProfileOpen(false)}>
                      My Profile
                    </Link>
                    <Link href="/profile/settings/general" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" onClick={() => setProfileOpen(false)}>
                      Settings
                    </Link>
                    <Link href="/profile/claims" className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" onClick={() => setProfileOpen(false)}>
                      Claim Center
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-red-600 hover:bg-zinc-100 dark:text-red-400 dark:hover:bg-zinc-800" onClick={() => setProfileOpen(false)}>
                        Admin Hub
                      </Link>
                    )}
                    <div className="mt-1 border-t border-zinc-200 pt-1 dark:border-zinc-800">
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative z-50 h-[40px] w-[110px] flex justify-end items-start shrink-0">
              {authDropdownOpen && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setAuthDropdownOpen(false)} />
              )}
              
              <AnimatePresence>
                <motion.div 
                  layout
                  initial={false}
                  animate={{ 
                    height: authDropdownOpen ? 104 : 40,
                    borderRadius: authDropdownOpen ? 20 : 40
                  }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className={`group absolute right-0 top-0 overflow-hidden flex flex-col justify-start bg-transparent text-zinc-900 border border-zinc-200 origin-top dark:text-zinc-50 dark:border-zinc-800 z-50 w-[110px] ${authDropdownOpen ? 'p-2 cursor-default shadow-lg bg-white dark:bg-zinc-950' : 'hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer transition-colors duration-300'}`}
                  onClick={() => !authDropdownOpen && setAuthDropdownOpen(true)}
                >
                  {/* Collapsed State Base Text */}
                  <div className={`absolute top-0 right-0 w-full h-[40px] min-h-[40px] flex items-center justify-center transition-opacity duration-200 ${authDropdownOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'}`}>
                    <span className="text-sm font-bold">Login</span>
                  </div>
                  
                  {/* Expanded State Items */}
                  <div className={`flex flex-col w-full h-full text-zinc-900 dark:text-white transition-opacity duration-300 ${authDropdownOpen ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none'}`}>
                    <Link href="/auth/login" className="flex-1 flex items-center justify-center px-4 text-sm font-bold hover:bg-black hover:text-white rounded-xl dark:hover:bg-white dark:hover:text-black transition-colors" onClick={(e) => { e.stopPropagation(); setAuthDropdownOpen(false); }}>
                      Login
                    </Link>
                    <Link href="/auth/signup" className="flex-1 flex items-center justify-center px-4 text-sm font-bold hover:bg-black hover:text-white rounded-xl dark:hover:bg-white dark:hover:text-black transition-colors" onClick={(e) => { e.stopPropagation(); setAuthDropdownOpen(false); }}>
                      Signup
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          <div className="hidden sm:flex items-center">
             <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Pop-out overlay menu */}
      <>
        {/* Backdrop overlay without blur */}
        <div 
          className={`fixed inset-0 z-40 bg-transparent transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
          onClick={() => setMenuOpen(false)} 
        />
        
        {/* High-end floating drawer */}
        <div 
          className={`fixed left-4 top-4 z-50 flex w-[90vw] max-w-[480px] flex-col rounded-[2rem] bg-white dark:bg-[#09090b] p-6 shadow-2xl sm:left-6 sm:top-6 sm:p-8 sm:pr-12 border border-zinc-200 dark:border-zinc-800 origin-top-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-50 pointer-events-none shadow-none'}`}
        >
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#FF394A]" />
              <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-50">Explore</span>
            </div>
            <button 
              onClick={() => setMenuOpen(false)}
              className="flex h-8 w-8 -mr-5 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-[#FF394A] hover:text-white dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-[#FF394A] dark:hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col gap-2 sm:gap-4 mt-2">
            {navLinks.map((link, index) => {
              const isLocked = link.requiresAuth && !user;

              if (isLocked) {
                return (
                  <div
                    key={link.href}
                    className="group relative flex items-center w-max transition-all opacity-50 cursor-not-allowed"
                  >
                    <div className="flex items-start">
                      <div className="flex items-center justify-end overflow-hidden w-0 opacity-0 transition-all duration-300 group-hover:w-4 sm:group-hover:w-6 group-hover:opacity-100 group-hover:mr-1 text-zinc-500 mt-5 sm:mt-7">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-6 sm:h-6 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>

                      <span className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-500 leading-[0.85] whitespace-nowrap transition-colors duration-300">
                        {link.label}
                      </span>
                      <div className="ml-2 mt-1 shrink-0 border border-zinc-500 text-zinc-500 transition-colors duration-300 rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none flex items-center justify-center select-none">
                        0{index + 1}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex items-center w-max transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-start">
                    <div className="flex items-center justify-end overflow-hidden w-0 opacity-0 transition-all duration-300 group-hover:w-4 sm:group-hover:w-6 group-hover:opacity-100 group-hover:mr-1 text-zinc-900 dark:text-zinc-50 group-hover:!text-[#FF394A] mt-5 sm:mt-7">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-6 sm:h-6 shrink-0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    </div>

                    <span className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-50 group-hover:!text-[#FF394A] leading-[0.85] whitespace-nowrap transition-colors duration-300">
                      {link.label}
                    </span>
                    <div className="ml-2 mt-1 shrink-0 border border-[#FF394A] text-[#FF394A] group-hover:bg-[#FF394A] group-hover:text-white transition-colors duration-300 rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none flex items-center justify-center select-none">
                      0{index + 1}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </>
    </header>
  );
}
