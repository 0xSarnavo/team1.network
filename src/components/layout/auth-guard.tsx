'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { PageLoader } from '@/components/ui/spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowRegionLead?: boolean;
  requireModule?: string;
}

export function AuthGuard({ children, requireAdmin, allowRegionLead, requireModule }: AuthGuardProps) {
  const { user, loading, isAdmin, isRegionLead, hasModuleLead } = useAuth();
  const router = useRouter();

  if (loading) return <PageLoader />;

  if (!user) {
    router.push('/auth/login');
    return <PageLoader />;
  }

  if (requireAdmin && !isAdmin && !(allowRegionLead && isRegionLead)) {
    router.push('/');
    return <PageLoader />;
  }

  if (requireModule && !hasModuleLead(requireModule)) {
    router.push('/admin');
    return <PageLoader />;
  }

  return <>{children}</>;
}
