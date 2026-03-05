'use client';

import React, { use, useState } from 'react';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Trash2, X, ExternalLink } from 'lucide-react';

interface AnnouncementItem {
  id: string;
  title: string;
  link: string | null;
  audience: string;
  expiresAt: string | null;
  createdAt: string;
  createdBy: { id: string; displayName: string };
}

const AUDIENCES = ['public', 'member', 'all'];

export default function RegionAdminAnnouncementsPage({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = use(params);
  const slug = portalSlug.replace(/^portal-/, '');
  const apiBase = `/api/portal/regions/${slug}/admin/announcements`;
  const { data: announcements, loading, refetch } = useApi<AnnouncementItem[]>(apiBase);
  const { mutate: post, loading: creating } = useMutation<unknown>('post');
  const { mutate: del } = useMutation<unknown>('delete');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', link: '', audience: 'member', expiresAt: '' });

  const handleCreate = async () => {
    const payload = {
      title: form.title,
      link: form.link || undefined,
      audience: form.audience,
      expiresAt: form.expiresAt || undefined,
    };
    const res = await post(apiBase, payload);
    if (res.success) { setShowModal(false); setForm({ title: '', link: '', audience: 'member', expiresAt: '' }); refetch(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    const res = await del(`${apiBase}/${id}`);
    if (res.success) refetch();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Announcements</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
          <Plus className="h-4 w-4" /> Create Announcement
        </button>
      </div>

      {!announcements || announcements.length === 0 ? (
        <EmptyState title="No announcements" description="Create announcements for your region members." />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{a.title}</p>
                    {a.link && (
                      <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-500">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    by {a.createdBy.displayName} &middot; {new Date(a.createdAt).toLocaleDateString()}
                    {a.expiresAt && <> &middot; expires {new Date(a.expiresAt).toLocaleDateString()}</>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <AudienceBadge label={a.audience} />
                  <button onClick={() => handleDelete(a.id)} className="rounded-lg p-1.5 text-zinc-400 hover:text-red-500">
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
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Create Announcement</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <Field label="Title">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title..." />
              </Field>
              <Field label="Link (optional)">
                <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Audience">
                  <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 bg-card px-3 text-sm dark:border-zinc-800">
                    {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label="Expires At (optional)">
                  <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                </Field>
              </div>
              <p className="text-xs text-zinc-500">Max 6 announcements per audience type.</p>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
                <button onClick={handleCreate} disabled={creating || !form.title.trim()} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                  {creating ? 'Creating...' : 'Create'}
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
  return <div><label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>{children}</div>;
}

function AudienceBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    public: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    member: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    all: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[label] || colors.all}`}>{label}</span>;
}
