'use client';

import React, { use, useState } from 'react';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Pencil, Trash2, X, ChevronUp, ChevronDown, Eye, FileText } from 'lucide-react';

interface FormItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  visibility: string;
  fieldCount: number;
  submissionCount: number;
  createdAt: string;
}

interface FormField {
  label: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'checkbox' | 'url';
  required: boolean;
  options?: string[];
}

interface SubmissionData {
  form: { id: string; title: string; fields: FormField[] };
  submissions: Array<{
    id: string;
    data: Record<string, unknown>;
    createdAt: string;
    user: { id: string; email: string; displayName: string; avatarUrl: string | null } | null;
  }>;
}

const FIELD_TYPES: FormField['type'][] = ['text', 'textarea', 'email', 'number', 'select', 'checkbox', 'url'];
const STATUSES = ['draft', 'active', 'closed'];
const VISIBILITIES = ['admin', 'member', 'public'];

export default function RegionAdminFormsPage({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = use(params);
  const slug = portalSlug.replace(/^portal-/, '');
  const apiBase = `/api/portal/regions/${slug}/admin/forms`;
  const { data: forms, loading, refetch } = useApi<FormItem[]>(apiBase);
  const { mutate: post, loading: creating } = useMutation<unknown>('post');
  const { mutate: put } = useMutation<unknown>('put');
  const { mutate: del } = useMutation<unknown>('delete');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewSubmissionsId, setViewSubmissionsId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [visibility, setVisibility] = useState('member');
  const [fields, setFields] = useState<FormField[]>([{ label: '', type: 'text', required: false }]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setStatus('draft'); setVisibility('member');
    setFields([{ label: '', type: 'text', required: false }]);
    setEditId(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (f: FormItem) => {
    setTitle(f.title); setDescription(f.description || '');
    setStatus(f.status); setVisibility(f.visibility);
    setFields([{ label: '', type: 'text', required: false }]); // fields are not returned in list
    setEditId(f.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    const validFields = fields.filter(f => f.label.trim());
    const payload = { title, description: description || undefined, status, visibility, fields: validFields };

    if (editId) {
      const res = await put(`${apiBase}/${editId}`, payload);
      if (res.success) { setShowModal(false); refetch(); }
    } else {
      const res = await post(apiBase, payload);
      if (res.success) { setShowModal(false); refetch(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this form and all its submissions?')) return;
    const res = await del(`${apiBase}/${id}`);
    if (res.success) refetch();
  };

  // Field builder helpers
  const addField = () => setFields([...fields, { label: '', type: 'text', required: false }]);
  const removeField = (idx: number) => setFields(fields.filter((_, i) => i !== idx));
  const updateField = (idx: number, updates: Partial<FormField>) => {
    setFields(fields.map((f, i) => i === idx ? { ...f, ...updates } : f));
  };
  const moveField = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= fields.length) return;
    const copy = [...fields];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    setFields(copy);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Forms</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
          <Plus className="h-4 w-4" /> Create Form
        </button>
      </div>

      {!forms || forms.length === 0 ? (
        <EmptyState title="No forms yet" description="Create your first form for collecting data from members." />
      ) : (
        <div className="space-y-3">
          {forms.map((f) => (
            <Card key={f.id}>
              <CardContent className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{f.title}</p>
                  <p className="text-xs text-zinc-500">
                    {f.fieldCount} fields &middot; {f.submissionCount} submissions
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge label={f.status} />
                  <VisibilityBadge label={f.visibility} />
                  <button onClick={() => setViewSubmissionsId(f.id)} className="rounded-lg p-1.5 text-zinc-400 hover:text-blue-500" title="View Submissions">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEdit(f)} className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(f.id)} className="rounded-lg p-1.5 text-zinc-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Submissions Modal */}
      {viewSubmissionsId && (
        <SubmissionsModal
          slug={slug}
          formId={viewSubmissionsId}
          onClose={() => setViewSubmissionsId(null)}
        />
      )}

      {/* Create/Edit Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{editId ? 'Edit Form' : 'Create Form'}</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <FieldGroup label="Title">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Description">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-200 bg-card px-3 py-2 text-sm dark:border-zinc-800" />
              </FieldGroup>
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label="Status">
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-full rounded-lg border border-zinc-200 bg-card px-3 text-sm dark:border-zinc-800">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Visibility">
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="h-10 w-full rounded-lg border border-zinc-200 bg-card px-3 text-sm dark:border-zinc-800">
                    {VISIBILITIES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </FieldGroup>
              </div>

              {/* Form Field Builder */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-500">Form Fields</label>
                  <button onClick={addField} className="text-xs font-semibold text-red-500 hover:text-red-600">+ Add Field</button>
                </div>
                <div className="space-y-3">
                  {fields.map((field, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/30">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30"><ChevronUp className="h-3 w-3" /></button>
                        <button onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30"><ChevronDown className="h-3 w-3" /></button>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(idx, { label: e.target.value })}
                          placeholder="Field label"
                          className="col-span-1"
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateField(idx, { type: e.target.value as FormField['type'] })}
                          className="h-10 rounded-lg border border-zinc-200 bg-card px-2 text-xs dark:border-zinc-800"
                        >
                          {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                            <input type="checkbox" checked={field.required} onChange={(e) => updateField(idx, { required: e.target.checked })} />
                            Required
                          </label>
                        </div>
                        {field.type === 'select' && (
                          <Input
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(idx, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                            placeholder="Options (comma-separated)"
                            className="col-span-3"
                          />
                        )}
                      </div>
                      <button onClick={() => removeField(idx)} className="text-zinc-400 hover:text-red-500 mt-2"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
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

// Submissions Viewer Modal
function SubmissionsModal({ slug, formId, onClose }: { slug: string; formId: string; onClose: () => void }) {
  const { data, loading } = useApi<SubmissionData>(
    `/api/portal/regions/${slug}/admin/forms/${formId}/submissions`,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {data?.form.title || 'Submissions'}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="h-5 w-5" /></button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">Loading submissions...</div>
        ) : !data || data.submissions.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500">No submissions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-3 py-2 font-semibold text-zinc-500 text-xs">Submitter</th>
                  {(data.form.fields as FormField[]).map((f, i) => (
                    <th key={i} className="px-3 py-2 font-semibold text-zinc-500 text-xs">{f.label}</th>
                  ))}
                  <th className="px-3 py-2 font-semibold text-zinc-500 text-xs">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                      {sub.user?.displayName || sub.user?.email || 'Anonymous'}
                    </td>
                    {(data.form.fields as FormField[]).map((f, i) => (
                      <td key={i} className="px-3 py-2 text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">
                        {String((sub.data as Record<string, unknown>)[f.label] ?? '-')}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-zinc-500 whitespace-nowrap text-xs">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>{children}</div>;
}

function StatusBadge({ label }: { label: string }) {
  const color = label === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : label === 'closed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
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
