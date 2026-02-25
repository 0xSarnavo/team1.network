'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { PortalTopNav } from '@/components/portal/top-nav';
import { DashboardLeft } from '@/components/portal/dashboard-left';
import { DashboardRight } from '@/components/portal/dashboard-right';

interface RegionLead {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  title: string | null;
  role: string;
}

interface RegionMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  title: string | null;
  level: number;
  role: string;
  joinedAt: string;
}

interface RegionEvent {
  id: string;
  title: string;
  slug: string;
  type: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  isVirtual: boolean;
  rsvpCount: number;
}

interface RegionDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  country: string | null;
  city: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  memberCount: number;
  leads: RegionLead[];
  members: RegionMember[];
  events: RegionEvent[];
}

export default function RegionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: region, loading } = useApi<RegionDetail>(`/api/portal/regions/${slug}`);

  if (loading) return <PageLoader />;
  if (!region) return <div className="py-20 text-center text-zinc-600 dark:text-zinc-500">Region not found</div>;

  const isLead = region.leads.some((lead) => lead.id === user?.id);

  const locationParts = [region.city, region.country].filter(Boolean);
  const locationString = locationParts.length > 0 ? locationParts.join(', ') : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 relative">
      <PortalTopNav currentRegion={region} />
      
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
