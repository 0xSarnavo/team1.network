'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Guide { id: string; title: string; slug: string; category: string | null; status: string; }

export default function GuidesAdminPage() {
  const { addToast } = useToast();
  const { data: guides, loading, refetch } = useApi<Guide[]>('/api/portal/admin/guides');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', content: '', category: '', summary: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    setSaving(true);
    const res = await api.post('/api/portal/admin/guides', form);
    if (res.success) { addToast('success', 'Guide created'); setShowModal(false); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  const handleDelete = async () => { if (!deleteId) return; await api.delete(`/api/portal/admin/guides/${deleteId}`); setDeleteId(null); refetch(); addToast('success', 'Deleted'); };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Guides</h1>
        <Button onClick={() => { setForm({ title: '', slug: '', content: '', category: '', summary: '' }); setShowModal(true); }}>Create Guide</Button>
      </div>
      <DataTable columns={[
        { key: 'title', header: 'Title' },
        { key: 'slug', header: 'Slug' },
        { key: 'category', header: 'Category' },
        { key: 'actions', header: '', render: (r) => <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id as string)}>Delete</Button> },
      ]} data={(guides || []) as unknown as Record<string, unknown>[]} loading={loading} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Guide" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          <Input label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          <Input label="Summary" value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
          <Textarea label="Content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Guide?" message="This cannot be undone." confirmLabel="Delete" />
    </div>
  );
}
