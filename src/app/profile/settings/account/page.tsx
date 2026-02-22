'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageLoader } from '@/components/ui/spinner';

interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastActiveAt: string;
  isCurrent: boolean;
}

export default function AccountSettingsPage() {
  const { logout } = useAuth();
  const { addToast } = useToast();

  // Change password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Sessions
  const { data: sessions, loading: sessionsLoading, refetch: refetchSessions } = useApi<Session[]>('/api/auth/sessions');

  // Danger zone
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [dangerLoading, setDangerLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      addToast('error', 'Passwords do not match');
      return;
    }
    setPwLoading(true);
    const res = await api.post('/api/auth/change-password', pwForm);
    if (res.success) {
      addToast('success', 'Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      addToast('error', res.error?.message || 'Failed');
    }
    setPwLoading(false);
  };

  const revokeSession = async (id: string) => {
    await api.delete(`/api/auth/sessions/${id}`);
    refetchSessions();
    addToast('success', 'Session revoked');
  };

  const handleDeactivate = async () => {
    setDangerLoading(true);
    const res = await api.post('/api/profile/me/deactivate');
    if (res.success) {
      addToast('success', 'Account deactivated');
      logout();
    } else {
      addToast('error', res.error?.message || 'Failed');
    }
    setDangerLoading(false);
    setShowDeactivate(false);
  };

  const handleDelete = async () => {
    setDangerLoading(true);
    const res = await api.post('/api/profile/me/delete');
    if (res.success) {
      addToast('success', 'Deletion requested. 30-day grace period started.');
      logout();
    } else {
      addToast('error', res.error?.message || 'Failed');
    }
    setDangerLoading(false);
    setShowDelete(false);
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardTitle>Change Password</CardTitle>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} required />
          <Input label="New Password" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} required />
          <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} required />
          <Button type="submit" loading={pwLoading}>Change Password</Button>
        </form>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardTitle>Active Sessions</CardTitle>
        {sessionsLoading ? <PageLoader /> : (
          <div className="mt-4 space-y-3">
            {(sessions || []).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
                <div>
                  <p className="text-sm text-zinc-300">{s.userAgent?.slice(0, 50) || 'Unknown device'}</p>
                  <p className="text-xs text-zinc-600">IP: {s.ipAddress || 'Unknown'} &middot; {new Date(s.lastActiveAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.isCurrent && <Badge variant="success">Current</Badge>}
                  {!s.isCurrent && <Button variant="ghost" size="sm" onClick={() => revokeSession(s.id)}>Revoke</Button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-900/50">
        <CardTitle className="text-red-400">Danger Zone</CardTitle>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Deactivate Account</p>
              <p className="text-xs text-zinc-600">Temporarily disable your account</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDeactivate(true)}>Deactivate</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Delete Account</p>
              <p className="text-xs text-zinc-600">Permanently delete with 30-day grace period</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>Delete</Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog open={showDeactivate} onClose={() => setShowDeactivate(false)} onConfirm={handleDeactivate} title="Deactivate Account?" message="Your profile will be hidden. You can reactivate by logging in again." confirmLabel="Deactivate" loading={dangerLoading} />
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Account?" message="This will permanently delete your account after a 30-day grace period. This cannot be undone." confirmLabel="Delete Account" loading={dangerLoading} />
    </div>
  );
}
