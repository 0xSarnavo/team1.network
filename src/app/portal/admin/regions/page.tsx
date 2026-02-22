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
import { Badge } from '@/components/ui/badge';

interface Region { id: string; name: string; slug: string; country: string | null; city: string | null; isActive: boolean; }

export default function RegionsAdminPage() {
  const { addToast } = useToast();
  const { data: regions, loading, refetch } = useApi<Region[]>('/api/portal/admin/regions');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Region | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', country: '', city: '', description: '', logoUrl: '', coverImageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '', country: '', city: '', description: '', logoUrl: '', coverImageUrl: '' }); setShowModal(true); };
  const openEdit = (r: Region) => { setEditing(r); setForm({ name: r.name, slug: r.slug, country: r.country || '', city: r.city || '', description: '', logoUrl: '', coverImageUrl: '' }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const res = editing ? await api.put(`/api/portal/admin/regions/${editing.id}`, form) : await api.post('/api/portal/admin/regions', form);
    if (res.success) { addToast('success', 'Saved'); setShowModal(false); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  const handleDelete = async () => { if (!deleteId) return; await api.delete(`/api/portal/admin/regions/${deleteId}`); setDeleteId(null); refetch(); addToast('success', 'Deleted'); };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Regions</h1>
        <Button onClick={openCreate}>Add Region</Button>
      </div>
      <DataTable columns={[
        { key: 'name', header: 'Name' },
        { key: 'slug', header: 'Slug' },
        { key: 'country', header: 'Country' },
        { key: 'city', header: 'City' },
        { key: 'isActive', header: 'Status', render: (r) => <Badge variant={r.isActive ? 'success' : 'default'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
        { key: 'actions', header: '', render: (r) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => openEdit(r as unknown as Region)}>Edit</Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id as string)}>Delete</Button>
          </div>
        )},
      ]} data={(regions || []) as unknown as Record<string, unknown>[]} loading={loading} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Region' : 'Add Region'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
            <Input label="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="Logo URL" value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} />
          <Input label="Cover Image URL" value={form.coverImageUrl} onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Region?" message="All associated data will be affected." confirmLabel="Delete" />
    </div>
  );
}
