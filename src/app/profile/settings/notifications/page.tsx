'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';

interface NotifPref {
  type: string;
  email: boolean;
  inapp: boolean;
  push: boolean;
}

const defaultTypes = [
  'xp_earned', 'badge_earned', 'quest_available', 'event_reminder',
  'membership_update', 'grant_update', 'bounty_update', 'system',
];

export default function NotificationsSettingsPage() {
  const { addToast } = useToast();
  const { data: prefs, loading } = useApi<NotifPref[]>('/api/notifications/preferences');
  const [form, setForm] = useState<NotifPref[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefs) {
      const map: Record<string, NotifPref> = {};
      prefs.forEach((p) => { map[p.type] = p; });
      setForm(defaultTypes.map((t) => map[t] || { type: t, email: true, inapp: true, push: true }));
    } else {
      setForm(defaultTypes.map((t) => ({ type: t, email: true, inapp: true, push: true })));
    }
  }, [prefs]);

  const toggle = (index: number, channel: 'email' | 'inapp' | 'push') => {
    setForm((f) => f.map((p, i) => i === index ? { ...p, [channel]: !p[channel] } : p));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await api.put('/api/notifications/preferences', form);
    if (res.success) addToast('success', 'Notification preferences updated');
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  if (loading) return <PageLoader />;

  return (
    <Card>
      <CardTitle>Notification Preferences</CardTitle>
      <div className="mt-6">
        <div className="grid grid-cols-4 gap-4 border-b border-zinc-800 pb-2 text-xs font-medium text-zinc-500">
          <span>Type</span><span className="text-center">Email</span><span className="text-center">In-App</span><span className="text-center">Push</span>
        </div>
        {form.map((pref, i) => (
          <div key={pref.type} className="grid grid-cols-4 gap-4 border-b border-zinc-800/50 py-3 items-center">
            <span className="text-sm text-zinc-300 capitalize">{pref.type.replace(/_/g, ' ')}</span>
            {(['email', 'inapp', 'push'] as const).map((ch) => (
              <div key={ch} className="flex justify-center">
                <button
                  onClick={() => toggle(i, ch)}
                  className={`h-5 w-9 rounded-full transition-colors ${pref[ch] ? 'bg-red-600' : 'bg-zinc-700'}`}
                >
                  <div className={`h-4 w-4 rounded-full bg-white transition-transform ${pref[ch] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Button className="mt-6" onClick={handleSave} loading={saving}>Save Preferences</Button>
    </Card>
  );
}
