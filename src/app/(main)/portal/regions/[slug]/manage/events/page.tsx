'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/lib/context/toast-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  status: string;
  location: string | null;
  isVirtual: boolean;
  startDate: string;
  endDate: string | null;
  capacity: number | null;
  rsvpCount: number;
  createdAt: string;
}

interface RegionInfo {
  region: { id: string; name: string; slug: string };
}

const EVENT_TYPE_OPTIONS = [
  { value: 'meetup', label: 'Meetup' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'conference', label: 'Conference' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'ama', label: 'AMA' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function toSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function RegionEventsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToast } = useToast();

  const { data: regionInfo } = useApi<RegionInfo>(`/api/portal/regions/${slug}/manage`);
  const regionId = regionInfo?.region?.id;

  const { data: events, loading, refetch } = useApi<EventItem[]>(
    regionId ? `/api/portal/admin/events?regionId=${regionId}` : '',
    { immediate: !!regionId }
  );

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'meetup', status: 'draft',
    location: '', isVirtual: false, virtualUrl: '',
    startDate: '', endDate: '', capacity: '',
  });
  const { mutate: createEvent, loading: creating } = useMutation('post');

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.startDate || !regionId) {
      addToast('error', 'Title, description, and start date are required');
      return;
    }
    const eventSlug = toSlug(form.title) + '-' + Date.now().toString(36);
    const res = await createEvent('/api/portal/admin/events', {
      title: form.title, slug: eventSlug, description: form.description, type: form.type,
      status: form.status, regionId, location: form.location || undefined,
      isVirtual: form.isVirtual, virtualUrl: form.virtualUrl || undefined,
      startDate: form.startDate, endDate: form.endDate || undefined,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
    });
    if (res.success) {
      addToast('success', 'Event created');
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'meetup', status: 'draft', location: '', isVirtual: false, virtualUrl: '', startDate: '', endDate: '', capacity: '' });
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to create event');
    }
  };

  if (loading || !regionInfo) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500">Create and manage events for {regionInfo.region.name}.</p>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2 text-xs font-bold text-white transition-all hover:opacity-90 dark:bg-white dark:text-zinc-900 active:scale-95">
          Create Event
        </button>
      </div>

      {!events || events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Create your first event for this region."
          action={{ label: 'Create Event', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <div key={e.id} className="rounded-2xl border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <span className={e.status === 'published' ? 'text-emerald-500/70' : e.status === 'cancelled' ? 'text-rose-500/70' : ''}>{e.status}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span>{e.type}</span>
                    {e.isVirtual && (
                      <>
                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                        <span>Virtual</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{e.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-zinc-400">
                    <span>{new Date(e.startDate).toLocaleDateString()}</span>
                    {e.location && <span>{e.location}</span>}
                    <span>{e.rsvpCount} RSVPs</span>
                    {e.capacity && <span>Capacity: {e.capacity}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Event" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Monthly Meetup" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Event description..." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={EVENT_TYPE_OPTIONS} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date (optional)" type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. WeWork, NYC" />
            <Input label="Capacity (optional)" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
            <input type="checkbox" checked={form.isVirtual} onChange={(e) => setForm({ ...form, isVirtual: e.target.checked })} className="rounded border-zinc-300 bg-transparent text-[#FF394A] focus:ring-[#FF394A] dark:border-zinc-700" />
            Virtual event
          </label>
          {form.isVirtual && (
            <Input label="Virtual URL" value={form.virtualUrl} onChange={(e) => setForm({ ...form, virtualUrl: e.target.value })} placeholder="https://zoom.us/..." />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Cancel</button>
            <Button loading={creating} onClick={handleCreate}>Create Event</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
