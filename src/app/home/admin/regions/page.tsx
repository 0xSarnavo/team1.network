'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { PageLoader } from '@/components/ui/spinner';

interface RegionCard { id: string; regionId: string; description: string | null; isVisible: boolean; sortOrder: number; }

export default function RegionsAdminPage() {
  const { addToast } = useToast();
  const { data: cards, loading, refetch } = useApi<RegionCard[]>('/api/home/admin/regions');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ regionId: '', description: '', isVisible: true, sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await api.put('/api/home/admin/regions', form);
    if (res.success) { addToast('success', 'Region card updated'); setShowModal(false); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Region Cards</h1>
        <Button onClick={() => { setForm({ regionId: '', description: '', isVisible: true, sortOrder: 0 }); setShowModal(true); }}>Add Region Card</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(cards || []).map((c) => (
          <Card key={c.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Region ID: {c.regionId}</p>
                <p className="text-sm text-zinc-300">{c.description || 'No description'}</p>
                <p className="text-xs text-zinc-600">Order: {c.sortOrder} | Visible: {c.isVisible ? 'Yes' : 'No'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setForm({ regionId: c.regionId, description: c.description || '', isVisible: c.isVisible, sortOrder: c.sortOrder }); setShowModal(true); }}>Edit</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Region Card">
        <div className="space-y-4">
          <Input label="Region ID" value={form.regionId} onChange={(e) => setForm((f) => ({ ...f, regionId: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
