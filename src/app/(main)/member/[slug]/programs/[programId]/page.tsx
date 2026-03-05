'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { ArrowLeft, Briefcase, CalendarDays } from 'lucide-react';

interface ProgramDetail {
  id: string;
  title: string;
  description: string;
  body: { description?: string; markdown?: string } | null;
  eligibility: string | null;
  benefits: string | null;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  formFields: { label: string; type: string; required: boolean; options?: string[] }[] | null;
}

export default function ProgramDetailPage({ params }: { params: Promise<{ slug: string; programId: string }> }) {
  const { slug, programId } = use(params);
  const { user } = useAuth();
  const { data: program, loading } = useApi<ProgramDetail>(`/api/portal/programs/${programId}`);
  const { mutate: post, loading: submitting } = useMutation<unknown>('post');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!program) return;
    const res = await post(`/api/portal/regions/${slug}/applications`, {
      entityType: 'program',
      entityId: program.id,
      email: user?.email || formData.email || '',
      formData: { ...formData, name: user?.displayName || formData.name || '' },
    });
    if (res.success) setSubmitted(true);
  };

  if (loading || !program) return <PageLoader />;

  const markdown = program.body?.markdown || program.description;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href={`/member/${slug}`} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-2 flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-red-500" />
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          program.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-zinc-800 text-zinc-400'
        }`}>{program.status}</span>
      </div>

      <h1 className="mb-4 text-3xl font-black text-zinc-900 dark:text-zinc-50">{program.title}</h1>

      {(program.startsAt || program.endsAt) && (
        <div className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
          <CalendarDays className="h-4 w-4" />
          {program.startsAt && new Date(program.startsAt).toLocaleDateString()}
          {program.endsAt && ` — ${new Date(program.endsAt).toLocaleDateString()}`}
        </div>
      )}

      <div className="prose prose-sm prose-invert max-w-none mb-8 whitespace-pre-wrap">
        {markdown}
      </div>

      {program.eligibility && (
        <div className="mb-6">
          <h2 className="mb-2 text-base font-bold text-zinc-200">Eligibility</h2>
          <p className="text-sm text-zinc-400 whitespace-pre-wrap">{program.eligibility}</p>
        </div>
      )}

      {program.benefits && (
        <div className="mb-8">
          <h2 className="mb-2 text-base font-bold text-zinc-200">Benefits</h2>
          <p className="text-sm text-zinc-400 whitespace-pre-wrap">{program.benefits}</p>
        </div>
      )}

      {/* Application Form */}
      {program.formFields && program.formFields.length > 0 && !submitted && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-bold text-zinc-100">Apply</h2>
            <div className="space-y-4">
              <Field label="Name">
                <Input value={user?.displayName || formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!!user?.displayName} />
              </Field>
              <Field label="Email">
                <Input value={user?.email || formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!!user?.email} />
              </Field>
              {program.formFields.map((field) => (
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
            <p className="text-sm font-semibold text-green-400">Your application has been submitted!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs font-medium text-zinc-500">{label}</label>{children}</div>;
}
