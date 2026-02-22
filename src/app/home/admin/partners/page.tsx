'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Partner { id: string; name: string; logoUrl: string; websiteUrl: string | null; sortOrder: number; isActive: boolean; }

export default function PartnersAdminPage() {
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const { data, loading, pagination, refetch } = useApi<Partner[]>(`/api/home/admin/partners?page=${page}`);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState({ name: '', logoUrl: '', websiteUrl: '', sortOrder: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => { setEditing(null); setForm({ name: '', logoUrl: '', websiteUrl: '', sortOrder: 0, isActive: true }); setShowModal(true); };
  const openEdit = (p: Partner) => { setEditing(p); setForm({ name: p.name, logoUrl: p.logoUrl, websiteUrl: p.websiteUrl || '', sortOrder: p.sortOrder, isActive: p.isActive }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const res = editing ? await api.put(`/api/home/admin/partners/${editing.id}`, form) : await api.post('/api/home/admin/partners', form);
    if (res.success) { addToast('success', 'Saved'); setShowModal(false); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  const handleDelete = async () => { if (!deleteId) return; await api.delete(`/api/home/admin/partners/${deleteId}`); setDeleteId(null); refetch(); addToast('success', 'Deleted'); };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Partners</h1>
        <Button onClick={openCreate}>Add Partner</Button>
      </div>
      <DataTable columns={[
        { key: 'name', header: 'Name' },
        { key: 'logoUrl', header: 'Logo', render: (r) => <img src={r.logoUrl as string} alt="" className="h-8 w-8 rounded object-contain" /> },
        { key: 'sortOrder', header: 'Order' },
        { key: 'isActive', header: 'Active', render: (r) => <span className={r.isActive ? 'text-green-400' : 'text-zinc-600'}>{r.isActive ? 'Yes' : 'No'}</span> },
        { key: 'actions', header: '', render: (r) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => openEdit(r as unknown as Partner)}>Edit</Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id as string)}>Delete</Button>
          </div>
        )},
      ]} data={(data || []) as unknown as Record<string, unknown>[]} loading={loading} pagination={pagination ? { page, totalPages: pagination.totalPages, onPageChange: setPage } : undefined} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Partner' : 'Add Partner'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Logo URL" value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} />
          <Input label="Website URL" value={form.websiteUrl} onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))} />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Partner?" message="This cannot be undone." confirmLabel="Delete" />
    </div>
  );
}
