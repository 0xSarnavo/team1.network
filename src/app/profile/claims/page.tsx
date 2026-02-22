'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface ClaimItem {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  claimed: boolean;
}

interface Claims {
  badges: ClaimItem[];
  poaps: ClaimItem[];
  rewards: ClaimItem[];
}

export default function ClaimsPage() {
  const { addToast } = useToast();
  const { data: claims, loading, refetch } = useApi<Claims>('/api/profile/me/claims');

  const handleClaim = async (type: 'badges' | 'poaps' | 'rewards', id: string) => {
    const res = await api.post(`/api/profile/me/${type}/${id}/claim`);
    if (res.success) {
      addToast('success', 'Claimed successfully!');
      refetch();
    } else {
      addToast('error', res.error?.message || 'Claim failed');
    }
  };

  const renderItems = (items: ClaimItem[], type: 'badges' | 'poaps' | 'rewards') => {
    if (!items?.length) return <EmptyState title={`No ${type} available`} description="Check back later for new items to claim" />;
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-900/30 text-3xl">
                {type === 'badges' ? '★' : type === 'poaps' ? '🏆' : '🎁'}
              </div>
              <p className="font-medium text-zinc-200">{item.name}</p>
              {item.description && <p className="mt-1 text-xs text-zinc-500">{item.description}</p>}
              {item.claimed ? (
                <Badge variant="success" className="mt-3">Claimed</Badge>
              ) : (
                <Button size="sm" className="mt-3" onClick={() => handleClaim(type, item.id)}>Claim</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <AuthGuard>
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-100">Claim Center</h1>
        {loading ? <PageLoader /> : (
          <Tabs tabs={[
            { key: 'badges', label: 'Badges', content: renderItems(claims?.badges || [], 'badges') },
            { key: 'poaps', label: 'POAPs', content: renderItems(claims?.poaps || [], 'poaps') },
            { key: 'rewards', label: 'Rewards', content: renderItems(claims?.rewards || [], 'rewards') },
          ]} />
        )}
      </div>
      <Footer />
    </AuthGuard>
  );
}
