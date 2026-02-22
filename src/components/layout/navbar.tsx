'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/portal', label: 'Portal' },
  { href: '/grants', label: 'Grants' },
  { href: '/bounty', label: 'Bounty' },
  { href: '/ecosystem', label: 'Ecosystem' },
];

export function Navbar() {
  const { user, loading, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-red-500">
          team1
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-800" />
          ) : user ? (
            <div className="relative">
              {/* Notification bell */}
              <Link href="/notifications" className="mr-3 text-zinc-400 hover:text-zinc-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>

              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2">
                <Avatar src={user.avatarUrl} alt={user.displayName} size="sm" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-zinc-800 bg-zinc-900 py-2 shadow-xl">
                    <div className="border-b border-zinc-800 px-4 py-2">
                      <p className="font-medium text-zinc-200">{user.displayName}</p>
                      <p className="text-xs text-zinc-500">Level {user.level} &middot; {user.totalXp} XP</p>
                    </div>
                    <Link href="/portal/dashboard" className="block px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" onClick={() => setProfileOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href={`/profile/${user.username || user.id}`} className="block px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" onClick={() => setProfileOpen(false)}>
                      My Profile
                    </Link>
                    <Link href="/profile/settings/general" className="block px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" onClick={() => setProfileOpen(false)}>
                      Settings
                    </Link>
                    <Link href="/profile/claims" className="block px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200" onClick={() => setProfileOpen(false)}>
                      Claim Center
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-red-400 hover:bg-zinc-800" onClick={() => setProfileOpen(false)}>
                        Admin Hub
                      </Link>
                    )}
                    <div className="border-t border-zinc-800 mt-1 pt-1">
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full px-4 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="ml-2 md:hidden text-zinc-400" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-900"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
