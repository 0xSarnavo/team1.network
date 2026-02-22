'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Announcement {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  linkUrl: string | null;
  status: string;
  sortOrder: number;
}

export default function AnnouncementsAdminPage() {
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const { data, loading, pagination, refetch } = useApi<Announcement[]>(`/api/home/admin/announcements?page=${page}`);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: '', content: '', summary: '', linkUrl: '', status: 'draft', sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', content: '', summary: '', linkUrl: '', status: 'draft', sortOrder: 0 });
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({ title: a.title, content: a.content || '', summary: a.summary || '', linkUrl: a.linkUrl || '', status: a.status, sortOrder: a.sortOrder });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = editing
      ? await api.put(`/api/home/admin/announcements/${editing.id}`, form)
      : await api.post('/api/home/admin/announcements', form);
    if (res.success) { addToast('success', editing ? 'Updated' : 'Created'); setShowModal(false); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/api/home/admin/announcements/${deleteId}`);
    setDeleteId(null);
    refetch();
    addToast('success', 'Deleted');
  };

  const update = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Announcements</h1>
        <Button onClick={openCreate}>Create Announcement</Button>
      </div>

      <DataTable
        columns={[
          { key: 'title', header: 'Title' },
          { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'published' ? 'success' : 'default'}>{r.status as string}</Badge> },
          { key: 'sortOrder', header: 'Order' },
          { key: 'actions', header: '', render: (r) => (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => openEdit(r as unknown as Announcement)}>Edit</Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id as string)}>Delete</Button>
            </div>
          )},
        ]}
        data={(data || []) as unknown as Record<string, unknown>[]}
        loading={loading}
        pagination={pagination ? { page, totalPages: pagination.totalPages, onPageChange: setPage } : undefined}
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Announcement' : 'Create Announcement'} size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
          <Textarea label="Content" value={form.content} onChange={(e) => update('content', e.target.value)} />
          <Input label="Summary" value={form.summary} onChange={(e) => update('summary', e.target.value)} />
          <Input label="Link URL" value={form.linkUrl} onChange={(e) => update('linkUrl', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-zinc-300">Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => update('sortOrder', parseInt(e.target.value) || 0)} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Announcement?" message="This action cannot be undone." confirmLabel="Delete" />
    </div>
  );
}
