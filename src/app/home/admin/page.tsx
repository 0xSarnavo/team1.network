'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';

const sections = [
  { name: 'Hero Section', href: '/home/admin/hero', desc: 'Manage the hero banner, heading, and CTAs' },
  { name: 'About Section', href: '/home/admin/about', desc: 'Edit the about content and image' },
  { name: 'Announcements', href: '/home/admin/announcements', desc: 'Create and manage announcements' },
  { name: 'Stats', href: '/home/admin/stats', desc: 'Configure stat cards and counters' },
  { name: 'Partners', href: '/home/admin/partners', desc: 'Manage partner logos' },
  { name: 'Region Cards', href: '/home/admin/regions', desc: 'Configure featured regions' },
  { name: 'Footer', href: '/home/admin/footer', desc: 'Edit footer content and links' },
];

export default function HomeAdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Home Admin</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="hover:border-red-900/50 transition-colors cursor-pointer h-full">
              <CardTitle>{s.name}</CardTitle>
              <p className="mt-2 text-sm text-zinc-500">{s.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
