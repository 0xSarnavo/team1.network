'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/layout/auth-guard';

const settingsLinks = [
  { href: '/profile/settings/general', label: 'General' },
  { href: '/profile/settings/socials', label: 'Socials' },
  { href: '/profile/settings/privacy', label: 'Privacy' },
  { href: '/profile/settings/wallet', label: 'Wallet' },
  { href: '/profile/settings/notifications', label: 'Notifications' },
  { href: '/profile/settings/account', label: 'Account' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGuard>
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-100">Settings</h1>
        <div className="flex flex-col gap-8 md:flex-row">
          <nav className="shrink-0 md:w-48">
            <ul className="flex gap-1 md:flex-col">
              {settingsLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname === link.href
                        ? 'bg-red-900/30 text-red-400 font-medium'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
      <Footer />
    </AuthGuard>
  );
}
