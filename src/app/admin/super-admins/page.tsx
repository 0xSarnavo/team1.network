'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';

interface Admin { id: string; userId: string; role: string; userName: string; userEmail: string; avatarUrl: string | null; }

export default function SuperAdminsPage() {
  const { addToast } = useToast();
  const { data: admins, loading, refetch } = useApi<Admin[]>('/api/admin/super-admins');
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('super_admin');
  const [saving, setSaving] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const handlePromote = async () => {
    setSaving(true);
    const res = await api.post('/api/admin/super-admins', { email, role });
    if (res.success) { addToast('success', 'Admin promoted'); setShowModal(false); setEmail(''); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  const handleRemove = async () => {
    if (!removeId) return;
    const res = await api.delete(`/api/admin/super-admins/${removeId}`);
    if (res.success) { refetch(); addToast('success', 'Admin removed'); }
    else addToast('error', res.error?.message || 'Cannot remove — may be last SSA');
    setRemoveId(null);
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Super Admins</h1>
        <Button onClick={() => setShowModal(true)}>Add Admin</Button>
      </div>

      <div className="space-y-3">
        {(admins || []).map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={a.avatarUrl} alt={a.userName} size="md" />
                <div>
                  <p className="font-medium text-zinc-200">{a.userName}</p>
                  <p className="text-sm text-zinc-500">{a.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={a.role === 'super_super_admin' ? 'danger' : 'warning'}>
                  {a.role === 'super_super_admin' ? 'SSA' : 'SA'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setRemoveId(a.id)}>Remove</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Admin">
        <div className="space-y-4">
          <Input label="User Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
              <option value="super_admin">Super Admin (SA)</option>
              <option value="super_super_admin">Super Super Admin (SSA)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handlePromote} loading={saving}>Promote</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!removeId} onClose={() => setRemoveId(null)} onConfirm={handleRemove} title="Remove Admin?" message="This admin will lose their elevated access." confirmLabel="Remove" />
    </div>
  );
}
