'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { useRegionFilter } from '@/components/portal/region-filter-context';
import { MembershipCTA } from '@/components/portal/membership-cta';
import { EventsCarousel } from '@/components/portal/events-carousel';
import { ResourceTabs } from '@/components/portal/resource-tabs';
import { MemberVerification } from '@/components/portal/member-verification';
import { ContactBrandKit } from '@/components/portal/contact-brandkit';
import { PersonalCard } from '@/components/portal/personal-card';
import { QuestsPanel } from '@/components/portal/quests-panel';
import { LeaderboardPanel } from '@/components/portal/leaderboard-panel';

// ---------------------------------------------------------------------------
// Region Data Loader
// ---------------------------------------------------------------------------

interface DashboardRegion {
  id: string;
  name: string;
  slug: string;
}

interface DashboardPayload {
  regions: DashboardRegion[];
}

function RegionLoader() {
  const { user } = useAuth();
  const { setRegions } = useRegionFilter();
  const { data } = useApi<DashboardPayload>(
    user ? '/api/portal/dashboard' : '',
    { immediate: !!user },
  );

  useEffect(() => {
    if (data?.regions) {
      setRegions(data.regions.map((r) => ({ slug: r.slug, name: r.name })));
    }
  }, [data, setRegions]);

  return null;
}

// ---------------------------------------------------------------------------
// Mobile sidebar anchor
// ---------------------------------------------------------------------------

function MobileSidebarButton() {
  const scrollToSidebar = () => {
    const el = document.getElementById('portal-sidebar');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToSidebar}
      aria-label="Jump to personal panel"
      className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-lg transition-all hover:bg-[#FF394A] hover:text-white hover:border-[#FF394A] active:scale-95 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-[#FF394A] dark:hover:text-white dark:hover:border-[#FF394A] lg:hidden"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Portal Page
// ---------------------------------------------------------------------------

export default function PortalPage() {
  return (
    <>
      <RegionLoader />
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-20 sm:px-6 lg:px-8">
        {/* Membership CTA */}
        <div className="mb-6">
          <MembershipCTA />
        </div>

        {/* Two-column bento grid */}
        <div className="grid gap-5 md:grid-cols-[1fr_240px] lg:grid-cols-[1fr_288px]">
          {/* Left Column */}
          <div className="space-y-5">
            <EventsCarousel />
            <ResourceTabs />
            <MemberVerification />
            <ContactBrandKit />
          </div>

          {/* Right Column */}
          <div id="portal-sidebar" className="space-y-5">
            <PersonalCard />
            <QuestsPanel />
            <LeaderboardPanel />
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <MobileSidebarButton />
    </>
  );
}
