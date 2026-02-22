'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';

export default function FooterAdminPage() {
  const { addToast } = useToast();
  const { data, loading } = useApi<{ tagline: string | null; copyright: string | null; socials: Record<string, string> | null; columns: unknown | null }>('/api/home/admin/footer');
  const [form, setForm] = useState({ tagline: '', copyright: '', socialsJson: '{}', columnsJson: '[]' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm({
      tagline: data.tagline || '',
      copyright: data.copyright || '',
      socialsJson: data.socials ? JSON.stringify(data.socials, null, 2) : '{}',
      columnsJson: data.columns ? JSON.stringify(data.columns, null, 2) : '[]',
    });
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/home/admin/footer', {
        tagline: form.tagline,
        copyright: form.copyright,
        socials: JSON.parse(form.socialsJson),
        columns: JSON.parse(form.columnsJson),
      });
      if (res.success) addToast('success', 'Footer updated');
      else addToast('error', res.error?.message || 'Failed');
    } catch {
      addToast('error', 'Invalid JSON');
    }
    setSaving(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Footer</h1>
      <Card>
        <CardTitle>Edit Footer</CardTitle>
        <div className="mt-4 space-y-4">
          <Input label="Tagline" value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
          <Input label="Copyright" value={form.copyright} onChange={(e) => setForm((f) => ({ ...f, copyright: e.target.value }))} placeholder="&copy; 2024 team1" />
          <Textarea label="Social Links (JSON)" value={form.socialsJson} onChange={(e) => setForm((f) => ({ ...f, socialsJson: e.target.value }))} />
          <Textarea label="Footer Columns (JSON)" value={form.columnsJson} onChange={(e) => setForm((f) => ({ ...f, columnsJson: e.target.value }))} />
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
}
