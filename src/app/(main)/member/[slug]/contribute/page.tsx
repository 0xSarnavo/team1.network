'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Gift } from 'lucide-react';
import Link from 'next/link';

const CONTRIBUTION_TYPES = [
  { value: 'event-host', label: 'Event Hosting' },
  { value: 'content', label: 'Content Creation' },
];

export default function ContributePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { mutate: post, loading: submitting } = useMutation<unknown>('post');
  const [type, setType] = useState('event-host');
  const [form, setForm] = useState({
    eventDate: '', location: '', description: '', contentUrl: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const data: Record<string, unknown> = { description: form.description };
    if (type === 'event-host') {
      data.eventDate = form.eventDate;
      data.location = form.location;
    } else {
      data.contentUrl = form.contentUrl;
    }

    const res = await post(`/api/portal/regions/${slug}/contribute`, { type, data });
    if (res.success) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Card className="border-green-500/30">
          <CardContent className="p-8 text-center">
            <Gift className="mx-auto mb-4 h-10 w-10 text-green-400" />
            <h2 className="mb-2 text-xl font-bold text-zinc-100">Contribution Submitted!</h2>
            <p className="mb-6 text-sm text-zinc-500">Thank you for your contribution. A regional lead will review it soon.</p>
            <Link href={`/member/${slug}`} className="text-sm font-semibold text-red-500 hover:text-red-400">
              Back to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href={`/member/${slug}`} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <Gift className="h-6 w-6 text-red-500" />
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">Submit Contribution</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Contribution Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm">
              {CONTRIBUTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
              placeholder="Describe your contribution..."
            />
          </div>

          {type === 'event-host' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Event Date</label>
                <Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Location</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Event location" />
              </div>
            </>
          )}

          {type === 'content' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Content URL</label>
              <Input value={form.contentUrl} onChange={(e) => setForm({ ...form, contentUrl: e.target.value })} placeholder="https://..." />
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.description.trim()}
              className="rounded-lg bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Contribution'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
