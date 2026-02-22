'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';

export default function AboutAdminPage() {
  const { addToast } = useToast();
  const { data, loading } = useApi<{ content: string; imageUrl: string | null }>('/api/home/admin/about');
  const [form, setForm] = useState({ content: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm({ content: data.content || '', imageUrl: data.imageUrl || '' });
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    const res = await api.put('/api/home/admin/about', form);
    if (res.success) addToast('success', 'About section updated');
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">About Section</h1>
      <Card>
        <CardTitle>Edit About</CardTitle>
        <div className="mt-4 space-y-4">
          <Textarea label="Content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="About content..." />
          <Input label="Image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
