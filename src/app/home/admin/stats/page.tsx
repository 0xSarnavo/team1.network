'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageLoader } from '@/components/ui/spinner';

interface Stat { id: string; label: string; value: number | null; icon: string | null; autoKey: string | null; useAuto: boolean; sortOrder: number; }

export default function StatsAdminPage() {
  const { addToast } = useToast();
  const { data: stats, loading, refetch } = useApi<Stat[]>('/api/home/admin/stats');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Stat | null>(null);
  const [form, setForm] = useState({ label: '', value: 0, icon: '', sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm({ label: '', value: 0, icon: '', sortOrder: 0 }); setShowModal(true); };
  const openEdit = (s: Stat) => { setEditing(s); setForm({ label: s.label, value: s.value || 0, icon: s.icon || '', sortOrder: s.sortOrder }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const res = editing
      ? await api.put(`/api/home/admin/stats/${editing.id}`, form)
      : await api.post('/api/home/admin/stats', form);
    if (res.success) { addToast('success', 'Saved'); setShowModal(false); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/api/home/admin/stats/${deleteId}`);
    setDeleteId(null); refetch(); addToast('success', 'Deleted');
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Stats</h1>
        <Button onClick={openCreate}>Add Stat</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(stats || []).map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">{s.label}</p>
                <p className="text-2xl font-bold text-zinc-100">{s.value?.toLocaleString() ?? '—'}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(s.id)}>Del</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Stat' : 'Add Stat'}>
        <div className="space-y-4">
          <Input label="Label" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          <Input label="Value" type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: parseInt(e.target.value) || 0 }))} />
          <Input label="Icon" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="Icon name" />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Stat?" message="This stat will be removed." confirmLabel="Delete" />
    </div>
  );
}
