'use client';

import React, { use, useState } from 'react';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Pencil, Trash2, X, Eye, FileText } from 'lucide-react';
import { FormFieldBuilder, type FormFieldDef } from '@/components/admin/form-field-builder';

interface GuideItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  visibility: string;
  coverImageUrl: string | null;
  readTime: number | null;
  body: { description?: string; markdown?: string } | null;
  formFields: FormFieldDef[] | null;
  createdAt: string;
}

const CATEGORIES = ['getting-started', 'development', 'defi', 'nfts', 'tooling', 'community', 'other'];
const STATUSES = ['draft', 'published'];
const VISIBILITIES = ['admin', 'member', 'public'];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function RegionAdminGuidesPage({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = use(params);
  const slug = portalSlug.replace(/^portal-/, '');
  const apiBase = `/api/portal/regions/${slug}/admin/guides`;
  const { data: guides, loading, refetch } = useApi<GuideItem[]>(apiBase);
  const { mutate: post, loading: creating } = useMutation<unknown>('post');
  const { mutate: put } = useMutation<unknown>('put');
  const { mutate: del } = useMutation<unknown>('delete');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', category: 'getting-started', content: '', markdown: '',
    coverImageUrl: '', readTime: '', status: 'draft', visibility: 'member',
  });
  const [formFields, setFormFields] = useState<FormFieldDef[]>([]);

  // Applications modal
  const [appModalGuideId, setAppModalGuideId] = useState<string | null>(null);
  const { data: applications, loading: appsLoading } = useApi<any[]>(
    appModalGuideId ? `/api/portal/regions/${slug}/admin/guides/${appModalGuideId}/applications` : '',
    { immediate: !!appModalGuideId }
  );
  const { mutate: patchApp } = useMutation<unknown>('patch');

  const resetForm = () => {
    setForm({ title: '', slug: '', category: 'getting-started', content: '', markdown: '',
      coverImageUrl: '', readTime: '', status: 'draft', visibility: 'member' });
    setFormFields([]);
    setEditId(null);
    setPreviewMode(false);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (g: GuideItem) => {
    setForm({
      title: g.title, slug: g.slug, category: g.category, content: g.body?.description || '',
      markdown: g.body?.markdown || '', coverImageUrl: g.coverImageUrl || '',
      readTime: g.readTime?.toString() || '', status: g.status, visibility: g.visibility,
    });
    setFormFields(g.formFields || []);
    setEditId(g.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    const validFields = formFields.filter(f => f.label.trim());
    const payload = {
      ...form,
      readTime: form.readTime ? parseInt(form.readTime) : undefined,
      coverImageUrl: form.coverImageUrl || undefined,
      body: form.markdown ? { description: form.content, markdown: form.markdown } : undefined,
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
    if (!confirm('Delete this guide?')) return;
    const res = await del(`${apiBase}/${id}`);
    if (res.success) refetch();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Guides</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
          <Plus className="h-4 w-4" /> Create Guide
        </button>
      </div>

      {!guides || guides.length === 0 ? (
        <EmptyState title="No guides yet" description="Create your first guide for this region." />
      ) : (
        <div className="space-y-3">
          {guides.map((g) => (
            <Card key={g.id}>
              <CardContent className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{g.title}</p>
                  <p className="text-xs text-zinc-500">
                    {g.category} &middot; {g.readTime ? `${g.readTime} min` : 'N/A'}
                    {g.formFields && g.formFields.length > 0 && <> &middot; {g.formFields.length} form fields</>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge label={g.status} />
                  <VisibilityBadge label={g.visibility} />
                  {g.formFields && g.formFields.length > 0 && (
                    <button onClick={() => setAppModalGuideId(g.id)} className="rounded-lg p-1.5 text-zinc-400 hover:text-blue-500" title="View Applications">
                      <FileText className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => openEdit(g)} className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(g.id)} className="rounded-lg p-1.5 text-zinc-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Applications Modal */}
      {appModalGuideId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Applications</h2>
              <button onClick={() => setAppModalGuideId(null)} className="text-zinc-400 hover:text-zinc-600"><X className="h-5 w-5" /></button>
            </div>
            {appsLoading ? (
              <p className="text-sm text-zinc-500 text-center py-8">Loading...</p>
            ) : !applications || applications.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <Card key={app.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{app.user?.displayName || app.email}</p>
                          <p className="text-xs text-zinc-500">{app.email} &middot; {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${app.status === 'approved' ? 'bg-green-900/30 text-green-400' : app.status === 'rejected' ? 'bg-red-900/30 text-red-400' : 'bg-amber-900/30 text-amber-400'}`}>{app.status}</span>
                          {app.status === 'pending' && (
                            <>
                              <button onClick={() => patchApp(`/api/portal/regions/${slug}/admin/applications/${app.id}`, { status: 'approved' })} className="text-xs font-semibold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded px-2 py-1">Approve</button>
                              <button onClick={() => patchApp(`/api/portal/regions/${slug}/admin/applications/${app.id}`, { status: 'rejected' })} className="text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded px-2 py-1">Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                      {app.data && typeof app.data === 'object' && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(app.data as Record<string, unknown>).map(([key, value]) => (
                            <p key={key} className="text-xs text-zinc-500"><span className="font-medium text-zinc-600 dark:text-zinc-400">{key}:</span> {String(value)}</p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{editId ? 'Edit Guide' : 'Create Guide'}</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600"><X className="h-5 w-5" /></button>
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
              <div className="grid grid-cols-3 gap-3">
                <Field label="Category">
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 w-full rounded-lg border border-zinc-200 bg-card px-3 text-sm dark:border-zinc-800">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
              <Field label="Content (short description)">
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} className="w-full rounded-lg border border-zinc-200 bg-card px-3 py-2 text-sm dark:border-zinc-800" />
              </Field>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-500">Body (Markdown)</label>
                  <button type="button" onClick={() => setPreviewMode(!previewMode)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    <Eye className="h-3.5 w-3.5" /> {previewMode ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {previewMode ? (
                  <div className="min-h-[150px] rounded-lg border border-zinc-200 bg-card p-4 text-sm prose prose-sm dark:prose-invert dark:border-zinc-800 max-w-none whitespace-pre-wrap">
                    {form.markdown || 'Nothing to preview.'}
                  </div>
                ) : (
                  <textarea value={form.markdown} onChange={(e) => setForm({ ...form, markdown: e.target.value })} rows={8} className="w-full rounded-lg border border-zinc-200 bg-card px-3 py-2 text-sm font-mono dark:border-zinc-800" placeholder="Write detailed guide content in markdown..." />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cover Image URL">
                  <Input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://..." />
                </Field>
                <Field label="Read Time (min)">
                  <Input type="number" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} />
                </Field>
              </div>

              {/* Form Builder */}
              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <FormFieldBuilder fields={formFields} onChange={setFormFields} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
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
  return <div><label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>{children}</div>;
}

function StatusBadge({ label }: { label: string }) {
  const color = label === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>{label}</span>;
}

function VisibilityBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    public: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    member: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    admin: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[label] || colors.admin}`}>{label}</span>;
}
