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

import { PortalTopNav } from '@/components/portal/top-nav';
import { DashboardLeft } from '@/components/portal/dashboard-left';
import { DashboardRight } from '@/components/portal/dashboard-right';

export default function PortalPage() {
  const { data: hub, loading } = useApi<HubData>('/api/portal');

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 relative">
      <PortalTopNav />
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
           <DashboardLeft />
        </div>
        <div className="lg:col-span-4">
           <DashboardRight />
        </div>
      </div>
    </div>
  );
}
