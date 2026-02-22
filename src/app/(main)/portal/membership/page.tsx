'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';

interface MembershipStatus {
  regionId: string;
  regionName: string;
  status: string;
  appliedAt: string;
}

export default function MembershipPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: statuses, loading, refetch } = useApi<MembershipStatus[]>(
    user ? '/api/portal/membership/status' : '', { immediate: !!user }
  );
  const [form, setForm] = useState({ regionId: '', reason: '', skills: '', referral: '' });
  const [applying, setApplying] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');

  const handleApply = async () => {
    if (!user) { addToast('error', 'Please sign in to apply'); return; }
    setApplying(true);
    const res = await api.post('/api/portal/membership/apply', form);
    if (res.success) { addToast('success', 'Application submitted!'); setForm({ regionId: '', reason: '', skills: '', referral: '' }); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setApplying(false);
  };

  const handleVerify = async () => {
    const res = await api.post('/api/portal/membership/verify', { code: verifyCode });
    if (res.success) { addToast('success', 'Membership verified!'); refetch(); setVerifyCode(''); }
    else addToast('error', res.error?.message || 'Invalid code');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-100">Membership</h1>
      <p className="mb-8 text-zinc-500">Join a regional community</p>

      {/* Existing memberships */}
      {loading ? <PageLoader /> : statuses && statuses.length > 0 && (
        <Card className="mb-8">
          <CardTitle>Your Memberships</CardTitle>
          <CardContent className="mt-4 space-y-3">
            {statuses.map((s) => (
              <div key={s.regionId} className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3">
                <div>
                  <p className="font-medium text-zinc-200">{s.regionName}</p>
                  <p className="text-xs text-zinc-600">Applied: {new Date(s.appliedAt).toLocaleDateString()}</p>
                </div>
                <Badge variant={s.status === 'accepted' ? 'success' : s.status === 'pending' ? 'warning' : 'danger'}>
                  {s.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Apply */}
      <Card className="mb-8">
        <CardTitle>Apply for Membership</CardTitle>
        <div className="mt-4 space-y-4">
          <Input label="Region ID" value={form.regionId} onChange={(e) => setForm((f) => ({ ...f, regionId: e.target.value }))} placeholder="Select a region" />
          <Textarea label="Why do you want to join?" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          <Input label="Relevant Skills" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} placeholder="e.g. Solidity, Marketing" />
          <Input label="Referral (optional)" value={form.referral} onChange={(e) => setForm((f) => ({ ...f, referral: e.target.value }))} placeholder="Who referred you?" />
          <Button onClick={handleApply} loading={applying}>Submit Application</Button>
        </div>
      </Card>

      {/* Verify */}
      <Card>
        <CardTitle>Verify Membership</CardTitle>
        <p className="mt-1 text-sm text-zinc-500">Have a verification code? Enter it below.</p>
        <div className="mt-4 flex gap-3">
          <Input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="Enter code..." className="flex-1" />
          <Button onClick={handleVerify}>Verify</Button>
        </div>
      </Card>
    </div>
  );
}
