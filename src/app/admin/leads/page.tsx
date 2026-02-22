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
import { PageLoader } from '@/components/ui/spinner';

interface Lead { id: string; userId: string; module: string; userName: string; userEmail: string; assignedAt: string; }

const modules = ['portal', 'grants', 'bounty', 'home', 'ecosystem'];

export default function LeadsPage() {
  const { addToast } = useToast();
  const { data: leads, loading, refetch } = useApi<Lead[]>('/api/admin/leads');
  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const handleAssign = async () => {
    setSaving(true);
    const res = await api.post('/api/admin/leads', { module: selectedModule, userEmail: userSearch });
    if (res.success) { addToast('success', 'Lead assigned'); setShowModal(false); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  const handleRemove = async () => {
    if (!removeId) return;
    await api.delete(`/api/admin/leads/${removeId}`);
    setRemoveId(null); refetch(); addToast('success', 'Lead removed');
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Module Leads</h1>
        <Button onClick={() => setShowModal(true)}>Assign Lead</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((mod) => {
          const moduleLead = leads?.find((l) => l.module === mod);
          return (
            <Card key={mod}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="capitalize">{mod}</CardTitle>
                  {moduleLead ? (
                    <div className="mt-2">
                      <p className="text-sm text-zinc-300">{moduleLead.userName}</p>
                      <p className="text-xs text-zinc-500">{moduleLead.userEmail}</p>
                    </div>
                  ) : (
                    <Badge variant="warning" className="mt-2">No Lead Assigned</Badge>
                  )}
                </div>
                {moduleLead && <Button variant="ghost" size="sm" onClick={() => setRemoveId(moduleLead.id)}>Remove</Button>}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Assign Module Lead">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Module</label>
            <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
              <option value="">Select module</option>
              {modules.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
          </div>
          <Input label="User Email" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="user@example.com" />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleAssign} loading={saving}>Assign</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!removeId} onClose={() => setRemoveId(null)} onConfirm={handleRemove} title="Remove Lead?" message="This will remove the module lead assignment." confirmLabel="Remove" />
    </div>
  );
}
