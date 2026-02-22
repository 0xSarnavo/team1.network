'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Quest { id: string; title: string; category: string; xpReward: number; difficulty: string; status: string; }

export default function QuestsAdminPage() {
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const { data: quests, loading, pagination, refetch } = useApi<Quest[]>(`/api/portal/admin/quests?page=${page}`);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'onboarding', xpReward: 100, difficulty: 'easy', requirements: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    setSaving(true);
    const res = await api.post('/api/portal/admin/quests', form);
    if (res.success) { addToast('success', 'Quest created'); setShowModal(false); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  const handleDelete = async () => { if (!deleteId) return; await api.delete(`/api/portal/admin/quests/${deleteId}`); setDeleteId(null); refetch(); addToast('success', 'Deleted'); };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Quests</h1>
        <Button onClick={() => { setForm({ title: '', description: '', category: 'onboarding', xpReward: 100, difficulty: 'easy', requirements: '' }); setShowModal(true); }}>Create Quest</Button>
      </div>
      <DataTable columns={[
        { key: 'title', header: 'Title' },
        { key: 'category', header: 'Category', render: (r) => <Badge variant="info">{r.category as string}</Badge> },
        { key: 'xpReward', header: 'XP Reward', render: (r) => <Badge variant="success">+{r.xpReward as number} XP</Badge> },
        { key: 'difficulty', header: 'Difficulty' },
        { key: 'actions', header: '', render: (r) => <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id as string)}>Delete</Button> },
      ]} data={(quests || []) as unknown as Record<string, unknown>[]} loading={loading} pagination={pagination ? { page, totalPages: pagination.totalPages, onPageChange: setPage } : undefined} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Quest" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} options={[
              { value: 'onboarding', label: 'Onboarding' }, { value: 'weekly', label: 'Weekly' },
              { value: 'community', label: 'Community' }, { value: 'special', label: 'Special' },
            ]} />
            <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))} options={[
              { value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' },
            ]} />
          </div>
          <Input label="XP Reward" type="number" value={form.xpReward} onChange={(e) => setForm((f) => ({ ...f, xpReward: parseInt(e.target.value) || 0 }))} />
          <Textarea label="Requirements" value={form.requirements} onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Quest?" message="This cannot be undone." confirmLabel="Delete" />
    </div>
  );
}
