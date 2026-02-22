'use client';

import React from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';

interface HubData {
  regions: { id: string; name: string; slug: string; description: string | null; logoUrl: string | null; memberCount: number }[];
  counts: { upcomingEvents: number; activeQuests: number; publishedGuides: number; activePrograms: number };
}

const quickLinks = [
  { name: 'Dashboard', href: '/portal/dashboard', desc: 'Your personal dashboard & activity', color: 'text-red-400' },
  { name: 'Events', href: '/portal/events', desc: 'Discover meetups, hackathons & workshops', color: 'text-blue-400' },
  { name: 'Quests', href: '/portal/quests', desc: 'Complete challenges & earn XP', color: 'text-yellow-400' },
  { name: 'Guides', href: '/portal/guides', desc: 'Learn from community guides', color: 'text-green-400' },
  { name: 'Programs', href: '/portal/programs', desc: 'Join community programs', color: 'text-purple-400' },
  { name: 'Members', href: '/portal/members', desc: 'Connect with community members', color: 'text-pink-400' },
  { name: 'Membership', href: '/portal/membership', desc: 'Apply to join a region', color: 'text-cyan-400' },
];

export default function PortalPage() {
  const { data: hub, loading } = useApi<HubData>('/api/portal');

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-100">Portal</h1>
      <p className="mb-8 text-zinc-500">Your gateway to the community — explore regions or browse global content</p>

      {/* Quick Links */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:border-zinc-700 transition-colors cursor-pointer h-full">
              <h3 className={`text-lg font-bold ${link.color}`}>{link.name}</h3>
              <p className="mt-2 text-sm text-zinc-500">{link.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Regions */}
      <h2 className="mb-4 text-2xl font-bold text-zinc-100">Regions</h2>
      <p className="mb-6 text-sm text-zinc-500">Click on a region to see its events, members, and activity</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(hub?.regions || []).map((r) => (
          <Link key={r.id} href={`/portal/regions/${r.slug}`}>
            <Card className="hover:border-red-900/50 transition-colors cursor-pointer h-full">
              <div className="flex items-center gap-3">
                {r.logoUrl ? <img src={r.logoUrl} alt={r.name} className="h-10 w-10 rounded-full object-cover" /> : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900/30 text-red-400 font-bold">{r.name[0]}</div>
                )}
                <div>
                  <h3 className="font-semibold text-zinc-200">{r.name}</h3>
                  <Badge variant="default">{r.memberCount} members</Badge>
                </div>
              </div>
              {r.description && <p className="mt-3 text-sm text-zinc-500 line-clamp-2">{r.description}</p>}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
