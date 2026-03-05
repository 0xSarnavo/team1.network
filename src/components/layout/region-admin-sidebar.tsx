'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart,
  Users,
  BookOpen,
  Briefcase,
  CalendarDays,
  Megaphone,
  FileText,
  Lightbulb,
  ArrowLeft,
} from 'lucide-react';

interface RegionAdminSidebarProps {
  slug: string;
  regionName?: string;
  regionLogoUrl?: string | null;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: BarChart, path: '' },
  { id: 'members', label: 'Members', icon: Users, path: '/members' },
  { id: 'guides', label: 'Guides', icon: BookOpen, path: '/guides' },
  { id: 'programs', label: 'Programs', icon: Briefcase, path: '/programs' },
  { id: 'events', label: 'Events', icon: CalendarDays, path: '/events' },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, path: '/announcements' },
  { id: 'playbooks', label: 'Playbooks', icon: FileText, path: '/playbooks' },
  { id: 'proposals', label: 'Proposals', icon: Lightbulb, path: '/proposals' },
];

export function RegionAdminSidebar({ slug, regionName, regionLogoUrl }: RegionAdminSidebarProps) {
  const pathname = usePathname();
  const basePath = `/admin/portal-${slug}`;

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-card text-card-foreground dark:border-zinc-800">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200 px-5 dark:border-zinc-800">
        {regionLogoUrl ? (
          <img src={regionLogoUrl} alt={regionName || slug} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 font-bold text-sm">
            {(regionName || slug).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {regionName || slug}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500">
            Regional Lead
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const href = basePath + item.path;
          const isActive = item.path === ''
            ? pathname === basePath
            : pathname.startsWith(href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-red-500/10 text-red-500 font-semibold'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <Link
          href={`/member/${slug}`}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Back to Member Portal</span>
        </Link>
      </div>
    </aside>
  );
}
