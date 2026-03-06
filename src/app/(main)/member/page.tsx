'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { PageLoader } from '@/components/ui/spinner';

export default function MemberRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user || !user.isMember || !user.primaryRegionSlug) {
      router.replace('/portal/global');
      return;
    }

    router.replace(`/member/${user.primaryRegionSlug}`);
  }, [user, loading, router]);

  return <PageLoader />;
}
