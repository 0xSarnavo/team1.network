'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';

export default function HeroAdminPage() {
  const { addToast } = useToast();
  const { data: hero, loading } = useApi<Record<string, string | null>>('/api/home/admin/hero');
  const [form, setForm] = useState({ heading: '', subheading: '', backgroundUrl: '', backgroundType: 'image' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hero) setForm({
      heading: (hero.heading as string) || '',
      subheading: (hero.subheading as string) || '',
      backgroundUrl: (hero.backgroundUrl as string) || '',
      backgroundType: (hero.backgroundType as string) || 'image',
    });
  }, [hero]);

  const handleSave = async () => {
    setSaving(true);
    const res = await api.put('/api/home/admin/hero', form);
    if (res.success) addToast('success', 'Hero updated');
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  if (loading) return <PageLoader />;

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Hero Section</h1>
      <Card>
        <CardTitle>Edit Hero</CardTitle>
        <div className="mt-4 space-y-4">
          <Input label="Heading" value={form.heading} onChange={(e) => update('heading', e.target.value)} placeholder="Main heading text" />
          <Textarea label="Subheading" value={form.subheading} onChange={(e) => update('subheading', e.target.value)} placeholder="Supporting text" />
          <Input label="Background URL" value={form.backgroundUrl} onChange={(e) => update('backgroundUrl', e.target.value)} placeholder="https://..." />
          <Input label="Background Type" value={form.backgroundType} onChange={(e) => update('backgroundType', e.target.value)} placeholder="image or video" />
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
