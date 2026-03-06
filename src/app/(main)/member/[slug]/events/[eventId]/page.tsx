'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { ArrowLeft, CalendarDays, MapPin, Users, Globe } from 'lucide-react';

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  body: { description?: string; markdown?: string } | null;
  type: string;
  status: string;
  coverImageUrl: string | null;
  location: string | null;
  isVirtual: boolean;
  virtualUrl: string | null;
  startDate: string;
  endDate: string | null;
  capacity: number | null;
  formFields: { label: string; type: string; required: boolean; options?: string[] }[] | null;
  _count: { rsvps: number };
}

export default function EventDetailPage({ params }: { params: Promise<{ slug: string; eventId: string }> }) {
  const { slug, eventId } = use(params);
  const { user } = useAuth();
  const { data: event, loading } = useApi<EventDetail>(`/api/portal/events/${eventId}`);
  const { mutate: post, loading: submitting } = useMutation<unknown>('post');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!event) return;
    const res = await post(`/api/portal/regions/${slug}/applications`, {
      entityType: 'event',
      entityId: event.id,
      email: user?.email || formData.email || '',
      formData: { ...formData, name: user?.displayName || formData.name || '' },
    });
    if (res.success) setSubmitted(true);
  };

  if (loading || !event) return <PageLoader />;

  const markdown = event.body?.markdown || event.description;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href={`/member/${slug}`} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      {event.coverImageUrl && (
        <img src={event.coverImageUrl} alt={event.title} className="mb-6 h-64 w-full rounded-2xl object-cover" />
      )}

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <CalendarDays className="h-5 w-5 text-red-500" />
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{event.type}</span>
      </div>

      <h1 className="mb-4 text-3xl font-black text-zinc-900 dark:text-zinc-50">{event.title}</h1>

      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          {new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        {event.location && (
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>
        )}
        {event.isVirtual && (
          <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> Virtual</span>
        )}
        <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {event._count?.rsvps || 0} RSVPs</span>
      </div>

      <div className="prose prose-sm prose-invert max-w-none mb-12 whitespace-pre-wrap">
        {markdown}
      </div>

      {/* Application Form */}
      {event.formFields && event.formFields.length > 0 && !submitted && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-bold text-zinc-100">Register / Apply</h2>
            <div className="space-y-4">
              <Field label="Name">
                <Input value={user?.displayName || formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!!user?.displayName} />
              </Field>
              <Field label="Email">
                <Input value={user?.email || formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!!user?.email} />
              </Field>
              {event.formFields.map((field) => (
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
                {submitting ? 'Submitting...' : 'Submit'}
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
