'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProposalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { mutate: post, loading: submitting } = useMutation<unknown>('post');
  const [form, setForm] = useState({ title: '', description: '' });

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    const res = await post(`/api/portal/regions/${slug}/proposals`, form);
    if (res.success) {
      router.push(`/member/${slug}/proposals`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href={`/member/${slug}/proposals`} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="h-4 w-4" /> Back to Proposals
      </Link>

      <h1 className="mb-8 text-3xl font-black text-zinc-900 dark:text-zinc-50">New Proposal</h1>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What's your idea?"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={8}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
              placeholder="Describe your proposal in detail. You can use markdown formatting."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Link href={`/member/${slug}/proposals`} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800">
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.title.trim() || !form.description.trim()}
              className="rounded-lg bg-red-500 px-6 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
