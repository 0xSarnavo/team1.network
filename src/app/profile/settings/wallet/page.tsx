'use client';

import React from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface Wallet {
  id: string;
  address: string;
  chain: string;
  isPrimary: boolean;
}

export default function WalletSettingsPage() {
  const { addToast } = useToast();
  const { data: wallets, loading, refetch } = useApi<Wallet[]>('/api/profile/me/wallet');

  const handleConnect = () => {
    addToast('info', 'Wallet connection coming soon — requires Web3 provider');
  };

  const handleSetPrimary = async (id: string) => {
    const res = await api.put(`/api/profile/me/wallet/${id}`, { isPrimary: true });
    if (res.success) { refetch(); addToast('success', 'Primary wallet updated'); }
    else addToast('error', res.error?.message || 'Failed');
  };

  const handleDisconnect = async (id: string) => {
    const res = await api.delete(`/api/profile/me/wallet/${id}`);
    if (res.success) { refetch(); addToast('success', 'Wallet disconnected'); }
    else addToast('error', res.error?.message || 'Failed');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Connected Wallets</CardTitle>
          <Button size="sm" onClick={handleConnect}>Connect Wallet</Button>
        </div>
        <div className="mt-4 space-y-3">
          {wallets && wallets.length > 0 ? wallets.map((w) => (
            <div key={w.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="flex-1">
                <p className="font-mono text-sm text-zinc-300">{w.address.slice(0, 6)}...{w.address.slice(-4)}</p>
                <p className="text-xs text-zinc-600">{w.chain}</p>
              </div>
              {w.isPrimary && <Badge variant="success">Primary</Badge>}
              {!w.isPrimary && (
                <Button variant="ghost" size="sm" onClick={() => handleSetPrimary(w.id)}>Set Primary</Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => handleDisconnect(w.id)}>Disconnect</Button>
            </div>
          )) : (
            <EmptyState title="No wallets connected" description="Connect your Web3 wallet to claim POAPs and rewards" action={{ label: 'Connect Wallet', onClick: handleConnect }} />
          )}
        </div>
      </Card>
    </div>
  );
}
