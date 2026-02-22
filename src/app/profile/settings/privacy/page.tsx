'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';

interface PrivacySetting {
  section: string;
  visibility: 'public' | 'members' | 'private';
}

const sections = ['email', 'socials', 'wallets', 'activity', 'badges', 'location'];

export default function PrivacySettingsPage() {
  const { addToast } = useToast();
  const { data: settings, loading } = useApi<PrivacySetting[]>('/api/profile/me/privacy');
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s) => { map[s.section] = s.visibility; });
      sections.forEach((s) => { if (!map[s]) map[s] = 'public'; });
      setForm(map);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const payload = Object.entries(form).map(([section, visibility]) => ({ section, visibility }));
    const res = await api.put('/api/profile/me/privacy', payload);
    if (res.success) addToast('success', 'Privacy settings updated');
    else addToast('error', res.error?.message || 'Failed to save');
    setSaving(false);
  };

  if (loading) return <PageLoader />;

  return (
    <Card>
      <CardTitle>Privacy Settings</CardTitle>
      <p className="mt-1 text-sm text-zinc-500">Control who can see your information.</p>
      <div className="mt-6 space-y-4">
        {sections.map((section) => (
          <div key={section} className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3">
            <span className="text-sm font-medium capitalize text-zinc-300">{section}</span>
            <select
              value={form[section] || 'public'}
              onChange={(e) => setForm((f) => ({ ...f, [section]: e.target.value }))}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300"
            >
              <option value="public">Public</option>
              <option value="members">Members Only</option>
              <option value="private">Private</option>
            </select>
          </div>
        ))}
      </div>
      <Button className="mt-6" onClick={handleSave} loading={saving}>Save Privacy Settings</Button>
    </Card>
  );
}
