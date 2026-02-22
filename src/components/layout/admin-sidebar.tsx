'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';

interface SidebarLink {
  href: string;
  label: string;
  module?: string;
}

interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

const sections: SidebarSection[] = [
  {
    title: 'Admin Hub',
    links: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/audit', label: 'Audit Log' },
      { href: '/admin/leads', label: 'Module Leads' },
      { href: '/admin/super-admins', label: 'Super Admins' },
      { href: '/admin/settings', label: 'Settings' },
    ],
  },
  {
    title: 'Home',
    links: [
      { href: '/home/admin', label: 'Home Admin', module: 'home' },
      { href: '/home/admin/hero', label: 'Hero', module: 'home' },
      { href: '/home/admin/about', label: 'About', module: 'home' },
      { href: '/home/admin/announcements', label: 'Announcements', module: 'home' },
      { href: '/home/admin/stats', label: 'Stats', module: 'home' },
      { href: '/home/admin/partners', label: 'Partners', module: 'home' },
      { href: '/home/admin/regions', label: 'Regions', module: 'home' },
      { href: '/home/admin/footer', label: 'Footer', module: 'home' },
    ],
  },
  {
    title: 'Portal',
    links: [
      { href: '/portal/admin', label: 'Portal Admin', module: 'portal' },
      { href: '/portal/admin/regions', label: 'Regions', module: 'portal' },
      { href: '/portal/admin/members', label: 'Members', module: 'portal' },
      { href: '/portal/admin/events', label: 'Events', module: 'portal' },
      { href: '/portal/admin/quests', label: 'Quests', module: 'portal' },
      { href: '/portal/admin/guides', label: 'Guides', module: 'portal' },
      { href: '/portal/admin/analytics', label: 'Analytics', module: 'portal' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { hasModuleLead, isSuperAdmin } = useAuth();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-zinc-800 bg-zinc-950 py-6 lg:block">
      <nav className="space-y-6 px-4">
        {sections.map((section) => {
          const visibleLinks = section.links.filter(
            (link) => !link.module || isSuperAdmin || hasModuleLead(link.module)
          );
          if (visibleLinks.length === 0) return null;

          return (
            <div key={section.title}>
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {visibleLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`block rounded-lg px-2 py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'bg-red-900/30 text-red-400 font-medium'
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
