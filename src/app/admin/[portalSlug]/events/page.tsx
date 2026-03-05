'use client';

import React, { use, useState } from 'react';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { FormFieldBuilder, type FormFieldDef } from '@/components/admin/form-field-builder';

interface EventItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  visibility: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  isVirtual: boolean;
  capacity: number | null;
  coverImageUrl: string | null;
  rsvpCount: number;
  formFields: FormFieldDef[] | null;
  createdAt: string;
}

const EVENT_TYPES = ['meetup', 'workshop', 'hackathon', 'conference', 'webinar', 'ama', 'other'];
const STATUSES = ['draft', 'published', 'ongoing', 'completed', 'cancelled'];
const VISIBILITIES = ['admin', 'member', 'public'];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function RegionAdminEventsPage({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = use(params);
  const slug = portalSlug.replace(/^portal-/, '');
  const apiBase = `/api/portal/regions/${slug}/admin/events`;
  const { data: events, loading, refetch } = useApi<EventItem[]>(apiBase);
  const { mutate: post, loading: creating } = useMutation<unknown>('post');
  const { mutate: put } = useMutation<unknown>('put');
  const { mutate: del } = useMutation<unknown>('delete');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', slug: '', description: '', type: 'meetup', status: 'draft',
    visibility: 'member', location: '', isVirtual: false, virtualUrl: '',
    startDate: '', endDate: '', capacity: '',
  });
  const [formFields, setFormFields] = useState<FormFieldDef[]>([]);

  const resetForm = () => {
    setForm({ title: '', slug: '', description: '', type: 'meetup', status: 'draft',
      visibility: 'member', location: '', isVirtual: false, virtualUrl: '',
      startDate: '', endDate: '', capacity: '' });
    setFormFields([]);
    setEditId(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (e: EventItem) => {
    setForm({
      title: e.title, slug: e.slug, description: '', type: e.type, status: e.status,
      visibility: e.visibility, location: e.location || '', isVirtual: e.isVirtual,
      virtualUrl: '', startDate: e.startDate.slice(0, 16), endDate: e.endDate?.slice(0, 16) || '',
      capacity: e.capacity?.toString() || '',
    });
    setFormFields(e.formFields || []);
    setEditId(e.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    const validFields = formFields.filter(f => f.label.trim());
    const payload = {
      ...form,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
      endDate: form.endDate || undefined,
      virtualUrl: form.virtualUrl || undefined,
      formFields: validFields.length > 0 ? validFields : null,
    };

    if (editId) {
      const res = await put(`${apiBase}/${editId}`, payload);
      if (res.success) { setShowModal(false); refetch(); }
    } else {
      const res = await post(apiBase, { ...payload, slug: form.slug || slugify(form.title) });
      if (res.success) { setShowModal(false); refetch(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    const res = await del(`${apiBase}/${id}`);
    if (res.success) refetch();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Events</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
          <Plus className="h-4 w-4" /> Create Event
        </button>
      </div>

      {!events || events.length === 0 ? (
        <EmptyState title="No events yet" description="Create your first event for this region." />
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{e.title}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(e.startDate).toLocaleDateString()} &middot; {e.type} &middot; {e.rsvpCount} RSVPs
                    {e.formFields && e.formFields.length > 0 && <> &middot; {e.formFields.length} form fields</>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge label={e.status} variant={e.status === 'published' ? 'green' : 'zinc'} />
                  <Badge label={e.visibility} variant={e.visibility === 'public' ? 'blue' : e.visibility === 'member' ? 'amber' : 'zinc'} />
                  <button onClick={() => openEdit(e)} className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(e.id)} className="rounded-lg p-1.5 text-zinc-400 hover:text-red-500" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editId ? 'Edit Event' : 'Create Event'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Title">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editId ? form.slug : slugify(e.target.value) })} />
              </Field>
              {!editId && (
                <Field label="Slug">
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </Field>
              )}
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-zinc-200 bg-card px-3 py-2 text-sm dark:border-zinc-800" />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Type">
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 bg-card px-3 text-sm dark:border-zinc-800">
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 bg-card px-3 text-sm dark:border-zinc-800">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Visibility">
                  <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 bg-card px-3 text-sm dark:border-zinc-800">
                    {VISIBILITIES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date">
                  <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </Field>
                <Field label="End Date">
                  <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </Field>
              </div>
              <Field label="Location">
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </Field>
              <Field label="Capacity">
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Leave empty for unlimited" />
              </Field>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" checked={form.isVirtual} onChange={(e) => setForm({ ...form, isVirtual: e.target.checked })} className="rounded border-zinc-300" />
                Virtual event
              </label>

              {/* Form Builder */}
              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <FormFieldBuilder fields={formFields} onChange={setFormFields} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={creating} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                  {creating ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

function Badge({ label, variant }: { label: string; variant: 'green' | 'amber' | 'blue' | 'zinc' }) {
  const colors = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    zinc: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[variant]}`}>
      {label}
    </span>
  );
}
