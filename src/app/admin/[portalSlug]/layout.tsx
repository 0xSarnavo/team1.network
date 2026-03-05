'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { RegionAdminSidebar } from '@/components/layout/region-admin-sidebar';
import { PageLoader } from '@/components/ui/spinner';

interface MembershipStatus {
  regionSlug: string;
  regionName: string;
  regionLogoUrl: string | null;
  role: string;
  status: string;
  isActive: boolean;
}

/**
 * Parses "portal-india" → "india", "portal-us" → "us", etc.
 * Returns null if the portalSlug doesn't start with "portal-".
 */
function parseRegionSlug(portalSlug: string): string | null {
  if (!portalSlug.startsWith('portal-')) return null;
  return portalSlug.slice('portal-'.length);
}

export default function RegionAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ portalSlug: string }>;
}) {
  const { portalSlug } = use(params);
  const slug = parseRegionSlug(portalSlug);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [regionName, setRegionName] = useState('');
  const [regionLogoUrl, setRegionLogoUrl] = useState<string | null>(null);

  const membershipUrl = user ? '/api/portal/membership/my-status' : '';
  const { data: memberships, loading: memberLoading } = useApi<MembershipStatus[]>(
    membershipUrl,
    { immediate: !!user },
  );

  // memberships is truly loaded only when we have a user, loading is done, and data is non-null
  const membershipsReady = !!user && !memberLoading && memberships !== null;

  useEffect(() => {
    if (!slug) return;
    if (authLoading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Wait until memberships have actually loaded
    if (!membershipsReady) return;

    // SSA/SA always allowed
    if (user.adminRoles?.isSuperAdmin || user.adminRoles?.isSuperSuperAdmin) {
      setAuthorized(true);
      const regionInfo = memberships?.find(m => m.regionSlug === slug);
      if (regionInfo) {
        setRegionName(regionInfo.regionName);
        setRegionLogoUrl(regionInfo.regionLogoUrl);
      } else {
        setRegionName(slug);
      }
      return;
    }

    // Check if user is lead/co_lead for this specific region
    const membership = memberships?.find(
      m => m.regionSlug === slug && m.status === 'accepted' && m.isActive &&
        (m.role === 'lead' || m.role === 'co_lead')
    );

    if (membership) {
      setAuthorized(true);
      setRegionName(membership.regionName);
      setRegionLogoUrl(membership.regionLogoUrl);
    } else {
      router.replace(`/member/${slug}`);
    }
  }, [user, memberships, authLoading, membershipsReady, slug, router]);

  // If the URL doesn't match "portal-*" pattern, trigger 404
  if (!slug) {
    notFound();
  }

  if (authLoading || memberLoading || !authorized) return <PageLoader />;

  return (
    <div className="flex h-screen overflow-hidden">
      <RegionAdminSidebar slug={slug} regionName={regionName} regionLogoUrl={regionLogoUrl} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
