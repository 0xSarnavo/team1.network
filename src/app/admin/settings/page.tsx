'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Card, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';

interface Settings {
  general: { platformName: string; description: string; logoUrl: string };
  modules: Record<string, boolean>;
  registration: { open: boolean; emailVerificationRequired: boolean };
  security: { sessionDuration: number; enforce2FA: boolean };
  xp: { levelCurve: string };
}

export default function SettingsPage() {
  const { addToast } = useToast();
  const { data: settings, loading } = useApi<Settings>('/api/admin/settings');
  const [general, setGeneral] = useState({ platformName: '', description: '', logoUrl: '' });
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [registration, setRegistration] = useState({ open: true, emailVerificationRequired: true });
  const [security, setSecurity] = useState({ sessionDuration: 30, enforce2FA: false });
  const [xp, setXp] = useState({ levelCurve: 'quadratic' });

  useEffect(() => {
    if (settings) {
      setGeneral(settings.general || { platformName: '', description: '', logoUrl: '' });
      setModules(settings.modules || {});
      setRegistration(settings.registration || { open: true, emailVerificationRequired: true });
      setSecurity(settings.security || { sessionDuration: 30, enforce2FA: false });
      setXp(settings.xp || { levelCurve: 'quadratic' });
    }
  }, [settings]);

  const saveSection = async (section: string, data: unknown) => {
    const res = await api.put('/api/admin/settings', { section, data });
    if (res.success) addToast('success', `${section} settings saved`);
    else addToast('error', res.error?.message || 'Failed');
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Platform Settings</h1>
      <Tabs tabs={[
        {
          key: 'general', label: 'General',
          content: (
            <Card>
              <CardTitle>General Settings</CardTitle>
              <div className="mt-4 space-y-4">
                <Input label="Platform Name" value={general.platformName} onChange={(e) => setGeneral((f) => ({ ...f, platformName: e.target.value }))} />
                <Textarea label="Description" value={general.description} onChange={(e) => setGeneral((f) => ({ ...f, description: e.target.value }))} />
                <Input label="Logo URL" value={general.logoUrl} onChange={(e) => setGeneral((f) => ({ ...f, logoUrl: e.target.value }))} />
                <Button onClick={() => saveSection('general', general)}>Save</Button>
              </div>
            </Card>
          ),
        },
        {
          key: 'modules', label: 'Modules',
          content: (
            <Card>
              <CardTitle>Module Configuration</CardTitle>
              <div className="mt-4 space-y-3">
                {['portal', 'grants', 'bounty', 'ecosystem', 'home'].map((mod) => (
                  <div key={mod} className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3">
                    <span className="text-sm font-medium capitalize text-zinc-300">{mod}</span>
                    <button
                      onClick={() => setModules((m) => ({ ...m, [mod]: !m[mod] }))}
                      className={`h-5 w-9 rounded-full transition-colors ${modules[mod] !== false ? 'bg-red-600' : 'bg-zinc-700'}`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${modules[mod] !== false ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
                <Button onClick={() => saveSection('modules', modules)}>Save</Button>
              </div>
            </Card>
          ),
        },
        {
          key: 'registration', label: 'Registration',
          content: (
            <Card>
              <CardTitle>Registration Settings</CardTitle>
              <div className="mt-4 space-y-4">
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" checked={registration.open} onChange={(e) => setRegistration((r) => ({ ...r, open: e.target.checked }))} />
                  Open Registration
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" checked={registration.emailVerificationRequired} onChange={(e) => setRegistration((r) => ({ ...r, emailVerificationRequired: e.target.checked }))} />
                  Require Email Verification
                </label>
                <Button onClick={() => saveSection('registration', registration)}>Save</Button>
              </div>
            </Card>
          ),
        },
        {
          key: 'security', label: 'Security',
          content: (
            <Card>
              <CardTitle>Security Settings</CardTitle>
              <div className="mt-4 space-y-4">
                <Input label="Session Duration (days)" type="number" value={security.sessionDuration} onChange={(e) => setSecurity((s) => ({ ...s, sessionDuration: parseInt(e.target.value) || 30 }))} />
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" checked={security.enforce2FA} onChange={(e) => setSecurity((s) => ({ ...s, enforce2FA: e.target.checked }))} />
                  Enforce 2FA for All Users
                </label>
                <Button onClick={() => saveSection('security', security)}>Save</Button>
              </div>
            </Card>
          ),
        },
        {
          key: 'xp', label: 'XP & Levels',
          content: (
            <Card>
              <CardTitle>XP Configuration</CardTitle>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-zinc-300">Level Curve</label>
                  <select value={xp.levelCurve} onChange={(e) => setXp({ levelCurve: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
                    <option value="linear">Linear</option>
                    <option value="quadratic">Quadratic</option>
                    <option value="exponential">Exponential</option>
                  </select>
                </div>
                <Button onClick={() => saveSection('xp', xp)}>Save</Button>
              </div>
            </Card>
          ),
        },
      ]} />
    </div>
  );
}
