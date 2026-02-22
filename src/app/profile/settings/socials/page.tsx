'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export default function SocialsSettingsPage() {
  const { addToast } = useToast();
  const { data: links, loading, refetch } = useApi<SocialLink[]>('/api/profile/me/socials');
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newPlatform || !newUrl) return;
    setAdding(true);
    const res = await api.post('/api/profile/me/socials', { platform: newPlatform, url: newUrl });
    if (res.success) {
      setNewPlatform('');
      setNewUrl('');
      refetch();
      addToast('success', 'Social link added');
    } else {
      addToast('error', res.error?.message || 'Failed to add');
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/api/profile/me/socials/${id}`);
    refetch();
    addToast('success', 'Link removed');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Social Links</CardTitle>
        <div className="mt-4 space-y-3">
          {links && links.length > 0 ? links.map((link) => (
            <div key={link.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-300">{link.platform}</p>
                <p className="text-xs text-zinc-500 truncate">{link.url}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(link.id)}>Remove</Button>
            </div>
          )) : (
            <EmptyState title="No social links" description="Add your social media profiles" />
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Add New Link</CardTitle>
        <div className="mt-4 space-y-3">
          <Input label="Platform" value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)} placeholder="e.g. Twitter, GitHub, LinkedIn" />
          <Input label="URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." />
          <Button onClick={handleAdd} loading={adding}>Add Link</Button>
        </div>
      </Card>
    </div>
  );
}
