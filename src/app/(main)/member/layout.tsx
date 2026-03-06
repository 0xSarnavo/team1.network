'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { PageLoader } from '@/components/ui/spinner';
import { MemberSidebar } from '@/components/member/member-sidebar';
import { MemberRightSidebar } from '@/components/member/member-right-sidebar';

interface DashboardData {
  user: {
    totalXp: number;
    level: number;
    displayName: string;
    avatarUrl?: string;
  };
  regions?: { id: string; name: string; slug: string; logoUrl: string | null; role: string }[];
}

interface MembershipStatus {
  id: string;
  regionSlug: string;
  regionName: string;
  role: string;
  status: string;
  isActive: boolean;
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Extract slug from pathname: /member/[slug]/...
  const segments = pathname.split('/');
  const slug = segments[2] || '';

  const { data: dashData, loading: dashLoading } = useApi<DashboardData>(
    authUser ? '/api/portal/dashboard' : '',
    { immediate: !!authUser },
  );

  const { data: allMemberships } = useApi<MembershipStatus[]>(
    authUser ? '/api/portal/membership/my-status' : '',
    { immediate: !!authUser },
  );

  const acceptedMemberships = (allMemberships || []).filter(
    (m) => m.status === 'accepted' && m.isActive,
  );

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!authUser || !authUser.isMember) {
      router.replace('/portal');
    }
  }, [authUser, authLoading, router]);

  if (authLoading || dashLoading || !authUser || !authUser.isMember) {
    return <PageLoader />;
  }

  const user = dashData?.user || {
    displayName: authUser?.displayName || 'Builder',
    totalXp: 0,
    level: 1,
    avatarUrl: authUser?.avatarUrl || null,
  };

  const regions = (dashData as any)?.regions || [];
  const currentRegion = acceptedMemberships.find((m) => m.regionSlug === slug);

  const sidebarRegions = regions.map((r: any) => ({
    name: r.name,
    slug: r.slug,
    role: r.role,
  }));

  return (
    <div
      className="member-shell flex flex-col min-h-screen"
      style={{ background: 'var(--m-bg)', color: 'var(--m-text)', paddingTop: 64 }}
    >
      {/* 3-Column Layout */}
      <div
        className="mx-auto w-full flex-1"
        style={{ maxWidth: 1380 }}
      >
        {/* Desktop: 3-col grid. Below lg: single column, sidebars hidden */}
        <div
          className="hidden lg:grid"
          style={{
            gridTemplateColumns: '206px 1fr 248px',
          }}
        >
          {/* Left Sidebar */}
          <MemberSidebar slug={slug} regions={sidebarRegions} />

          {/* Main Content */}
          <main style={{ padding: 24, minWidth: 0 }}>
            {children}
          </main>

          {/* Right Sidebar */}
          <MemberRightSidebar
            user={{
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              totalXp: user.totalXp,
              level: user.level,
              username: authUser?.username,
            }}
          />
        </div>

        {/* Mobile: single column, no sidebars */}
        <div className="block lg:hidden px-4 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
