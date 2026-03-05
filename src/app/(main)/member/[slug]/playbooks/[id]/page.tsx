'use client';

import React, { use, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PlaybookDetail {
  id: string;
  title: string;
  description: string | null;
  body: { description?: string; markdown?: string } | null;
  coverImageUrl: string | null;
  visibility: string;
  formFields: { label: string; type: string; required: boolean; options?: string[] }[] | null;
  createdBy: { id: string; displayName: string; avatarUrl: string | null };
  createdAt: string;
}

export default function PlaybookDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = use(params);
  const { user } = useAuth();
  const { data: playbook, loading } = useApi<PlaybookDetail>(`/api/portal/regions/${slug}/playbooks/${id}`);
  const { mutate: post, loading: submitting } = useMutation<unknown>('post');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const res = await post(`/api/portal/regions/${slug}/applications`, {
      entityType: 'playbook',
      entityId: id,
      email: user?.email || formData.email || '',
      formData: { ...formData, name: user?.displayName || formData.name || '' },
    });
    if (res.success) setSubmitted(true);
  };

  if (loading || !playbook) return <PageLoader />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href={`/member/${slug}/playbooks`} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="h-4 w-4" /> Back to Playbooks
      </Link>

      {playbook.coverImageUrl && (
        <img src={playbook.coverImageUrl} alt={playbook.title} className="mb-6 h-64 w-full rounded-2xl object-cover" />
      )}

      <div className="mb-2 flex items-center gap-2">
        <FileText className="h-5 w-5 text-red-500" />
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          playbook.visibility === 'public' ? 'bg-blue-900/30 text-blue-400' : 'bg-amber-900/30 text-amber-400'
        }`}>{playbook.visibility}</span>
      </div>

      <h1 className="mb-4 text-3xl font-black text-zinc-900 dark:text-zinc-50">{playbook.title}</h1>

      <p className="mb-2 text-sm text-zinc-500">
        by {playbook.createdBy.displayName} &middot; {new Date(playbook.createdAt).toLocaleDateString()}
      </p>

      {playbook.description && (
        <p className="mb-8 text-sm text-zinc-400">{playbook.description}</p>
      )}

      {playbook.body?.markdown && (
        <div className="prose prose-sm prose-invert max-w-none mb-12 whitespace-pre-wrap">
          {playbook.body.markdown}
        </div>
      )}

      {/* Application Form */}
      {playbook.formFields && playbook.formFields.length > 0 && !submitted && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-bold text-zinc-100">Apply / Submit</h2>
            <div className="space-y-4">
              <Field label="Name">
                <Input value={user?.displayName || formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!!user?.displayName} />
              </Field>
              <Field label="Email">
                <Input value={user?.email || formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!!user?.email} />
              </Field>
              {playbook.formFields.map((field) => (
                <Field key={field.label} label={field.label}>
                  {field.type === 'select' && field.options ? (
                    <select value={formData[field.label] || ''} onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })} className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm">
                      <option value="">Select...</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea value={formData[field.label] || ''} onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })} rows={3} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm" />
                  ) : (
                    <Input value={formData[field.label] || ''} onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })} />
                  )}
                </Field>
              ))}
              <button onClick={handleSubmit} disabled={submitting} className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {submitted && (
        <Card className="mt-8 border-green-500/30">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-semibold text-green-400">Your application has been submitted successfully!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>{children}</div>;
}
