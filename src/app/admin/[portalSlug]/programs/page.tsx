'use client';

import React, { use, useState } from 'react';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Pencil, Trash2, X, Eye, FileText } from 'lucide-react';
import { FormFieldBuilder, type FormFieldDef } from '@/components/admin/form-field-builder';

interface ProgramItem {
  id: string;
  title: string;
  description: string;
  body: { description?: string; markdown?: string } | null;
  eligibility: string | null;
  benefits: string | null;
  status: string;
  visibility: string;
  startsAt: string | null;
  endsAt: string | null;
  formFields: FormFieldDef[] | null;
  createdAt: string;
}

const STATUSES = ['draft', 'active', 'completed', 'cancelled'];
const VISIBILITIES = ['admin', 'member', 'public'];

export default function RegionAdminProgramsPage({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = use(params);
  const slug = portalSlug.replace(/^portal-/, '');
  const apiBase = `/api/portal/regions/${slug}/admin/programs`;
  const { data: programs, loading, refetch } = useApi<ProgramItem[]>(apiBase);
  const { mutate: post, loading: creating } = useMutation<unknown>('post');
  const { mutate: put } = useMutation<unknown>('put');
  const { mutate: del } = useMutation<unknown>('delete');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', markdown: '', eligibility: '', benefits: '',
    status: 'draft', visibility: 'member', startsAt: '', endsAt: '',
  });
  const [formFields, setFormFields] = useState<FormFieldDef[]>([]);

  // Applications modal
  const [appModalProgramId, setAppModalProgramId] = useState<string | null>(null);
  const { data: applications, loading: appsLoading } = useApi<any[]>(
    appModalProgramId ? `/api/portal/regions/${slug}/admin/programs/${appModalProgramId}/applications` : '',
    { immediate: !!appModalProgramId }
  );
  const { mutate: patchApp } = useMutation<unknown>('patch');

  const resetForm = () => {
    setForm({ title: '', description: '', markdown: '', eligibility: '', benefits: '',
      status: 'draft', visibility: 'member', startsAt: '', endsAt: '' });
    setFormFields([]);
    setEditId(null);
    setPreviewMode(false);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (p: ProgramItem) => {
    setForm({
      title: p.title, description: p.description, markdown: p.body?.markdown || '',
      eligibility: p.eligibility || '', benefits: p.benefits || '',
      status: p.status, visibility: p.visibility,
      startsAt: p.startsAt?.slice(0, 16) || '', endsAt: p.endsAt?.slice(0, 16) || '',
    });
    setFormFields(p.formFields || []);
    setEditId(p.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    const validFields = formFields.filter(f => f.label.trim());
    const payload = {
      ...form,
      body: form.markdown ? { description: form.description, markdown: form.markdown } : undefined,
      eligibility: form.eligibility || undefined,
      benefits: form.benefits || undefined,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
      formFields: validFields.length > 0 ? validFields : null,
    };

    if (editId) {
      const res = await put(`${apiBase}/${editId}`, payload);
      if (res.success) { setShowModal(false); refetch(); }
    } else {
      const res = await post(apiBase, payload);
      if (res.success) { setShowModal(false); refetch(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this program?')) return;
    const res = await del(`${apiBase}/${id}`);
    if (res.success) refetch();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Programs</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
          <Plus className="h-4 w-4" /> Create Program
        </button>
      </div>

      {!programs || programs.length === 0 ? (
        <EmptyState title="No programs yet" description="Create your first program for this region." />
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{p.title}</p>
                  <p className="text-xs text-zinc-500">
                    {p.description.slice(0, 60)}{p.description.length > 60 ? '...' : ''}
                    {p.formFields && p.formFields.length > 0 && <> &middot; {p.formFields.length} form fields</>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge label={p.status} />
                  <VisibilityBadge label={p.visibility} />
                  {p.formFields && p.formFields.length > 0 && (
                    <button onClick={() => setAppModalProgramId(p.id)} className="rounded-lg p-1.5 text-zinc-400 hover:text-blue-500" title="View Applications">
                      <FileText className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-zinc-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Applications Modal */}
      {appModalProgramId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Applications</h2>
              <button onClick={() => setAppModalProgramId(null)} className="text-zinc-400 hover:text-zinc-600"><X className="h-5 w-5" /></button>
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
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{editId ? 'Edit Program' : 'Create Program'}</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <Field label="Title">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-zinc-200 bg-card px-3 py-2 text-sm dark:border-zinc-800" />
              </Field>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-500">Body (Markdown)</label>
                  <button type="button" onClick={() => setPreviewMode(!previewMode)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    <Eye className="h-3.5 w-3.5" /> {previewMode ? 'Edit' : 'Preview'}
                  </button>
                </div>
                {previewMode ? (
                  <div className="min-h-[120px] rounded-lg border border-zinc-200 bg-card p-4 text-sm prose prose-sm dark:prose-invert dark:border-zinc-800 max-w-none whitespace-pre-wrap">
                    {form.markdown || 'Nothing to preview.'}
                  </div>
                ) : (
                  <textarea value={form.markdown} onChange={(e) => setForm({ ...form, markdown: e.target.value })} rows={6} className="w-full rounded-lg border border-zinc-200 bg-card px-3 py-2 text-sm font-mono dark:border-zinc-800" placeholder="Write detailed program content in markdown..." />
                )}
              </div>
              <Field label="Eligibility">
                <textarea value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} rows={2} className="w-full rounded-lg border border-zinc-200 bg-card px-3 py-2 text-sm dark:border-zinc-800" />
              </Field>
              <Field label="Benefits">
                <textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={2} className="w-full rounded-lg border border-zinc-200 bg-card px-3 py-2 text-sm dark:border-zinc-800" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
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
                <Field label="Starts At">
                  <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
                </Field>
                <Field label="Ends At">
                  <Input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
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
  const color = label === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
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
