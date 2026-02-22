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

interface Event { id: string; title: string; eventType: string; startDate: string; status: string; rsvpCount: number; }

export default function EventsAdminPage() {
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const { data: events, loading, pagination, refetch } = useApi<Event[]>(`/api/portal/admin/events?page=${page}`);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', eventType: 'meetup', startDate: '', endDate: '', location: '', isVirtual: false, maxAttendees: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    setSaving(true);
    const res = await api.post('/api/portal/admin/events', { ...form, maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : null });
    if (res.success) { addToast('success', 'Event created'); setShowModal(false); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSaving(false);
  };

  const handleDelete = async () => { if (!deleteId) return; await api.delete(`/api/portal/admin/events/${deleteId}`); setDeleteId(null); refetch(); addToast('success', 'Deleted'); };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Events</h1>
        <Button onClick={() => { setForm({ title: '', description: '', eventType: 'meetup', startDate: '', endDate: '', location: '', isVirtual: false, maxAttendees: '' }); setShowModal(true); }}>Create Event</Button>
      </div>
      <DataTable columns={[
        { key: 'title', header: 'Title' },
        { key: 'eventType', header: 'Type', render: (r) => <Badge variant="default">{r.eventType as string}</Badge> },
        { key: 'startDate', header: 'Date', render: (r) => <span className="text-sm">{new Date(r.startDate as string).toLocaleDateString()}</span> },
        { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'upcoming' ? 'info' : r.status === 'live' ? 'success' : 'default'}>{r.status as string}</Badge> },
        { key: 'rsvpCount', header: 'RSVPs' },
        { key: 'actions', header: '', render: (r) => <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id as string)}>Delete</Button> },
      ]} data={(events || []) as unknown as Record<string, unknown>[]} loading={loading} pagination={pagination ? { page, totalPages: pagination.totalPages, onPageChange: setPage } : undefined} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Event" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Select label="Event Type" value={form.eventType} onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))} options={[
            { value: 'meetup', label: 'Meetup' }, { value: 'hackathon', label: 'Hackathon' },
            { value: 'workshop', label: 'Workshop' }, { value: 'conference', label: 'Conference' },
          ]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="datetime-local" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            <Input label="End Date" type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>
          <Input label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Event?" message="This cannot be undone." confirmLabel="Delete" />
    </div>
  );
}
