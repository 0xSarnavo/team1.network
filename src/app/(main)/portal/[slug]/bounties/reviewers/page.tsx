'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/context/toast-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Reviewer {
  id: string;
  userId: string;
  bountyId: string | null;
  canCreate: boolean;
  user: { id: string; displayName: string; username: string | null; email: string; avatarUrl: string | null };
  createdAt: string;
}

interface RegionInfo {
  region: { id: string; name: string; slug: string };
}

export default function BountyReviewersPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToast } = useToast();

  const { data: regionInfo } = useApi<RegionInfo>(`/api/portal/regions/${slug}/manage`);
  const regionId = regionInfo?.region?.id;

  const { data: reviewers, loading, refetch } = useApi<Reviewer[]>(
    regionId ? `/api/bounty/admin/reviewers?regionId=${regionId}` : '',
    { immediate: !!regionId }
  );

  const [addEmail, setAddEmail] = useState('');
  const [canCreate, setCanCreate] = useState(false);
  const { mutate: addReviewer, loading: adding } = useMutation('post');

  const [removingId, setRemovingId] = useState<string | null>(null);
  const { mutate: removeReviewer, loading: removing } = useMutation('delete');

  const handleAdd = async () => {
    const email = addEmail.trim();
    if (!email || !regionId) { addToast('error', 'Please enter an email address'); return; }
    const res = await addReviewer('/api/bounty/admin/reviewers', { regionId, email, canCreate });
    if (res.success) { addToast('success', 'Reviewer added'); setAddEmail(''); setCanCreate(false); refetch(); }
    else addToast('error', res.error?.message || 'Failed to add reviewer');
  };

  const handleRemove = async () => {
    if (!removingId) return;
    const res = await removeReviewer(`/api/bounty/admin/reviewers?id=${removingId}`);
    if (res.success) { addToast('success', 'Reviewer removed'); setRemovingId(null); refetch(); }
    else addToast('error', res.error?.message || 'Failed to remove reviewer');
  };

  if (loading || !regionInfo) return <PageLoader />;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-24">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/portal/${slug}/bounties`} className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Manage Reviewers</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Delegate bounty review access to trusted members of {regionInfo.region.name}.
        </p>
      </div>

      {/* Add Reviewer */}
      <div className="mb-8 rounded-2xl border border-zinc-200/60 p-5 dark:border-zinc-800/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-1">Add Reviewer</h3>
        <p className="text-[10px] text-zinc-500 mb-4">Enter the email of a platform user to grant them reviewer access.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input label="Email" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="user@example.com" className="sm:max-w-xs" />
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
            <input type="checkbox" checked={canCreate} onChange={(e) => setCanCreate(e.target.checked)} className="rounded border-zinc-300 bg-transparent text-[#FF394A] focus:ring-[#FF394A] dark:border-zinc-700" />
            Can also create bounties
          </label>
          <Button loading={adding} onClick={handleAdd}>Add Reviewer</Button>
        </div>
      </div>

      {/* Reviewer list */}
      {!reviewers || reviewers.length === 0 ? (
        <EmptyState title="No reviewers yet" description="Region leads automatically have reviewer access. Add more reviewers to delegate submission review." />
      ) : (
        <div className="rounded-2xl border border-zinc-200/60 p-5 dark:border-zinc-800/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">Current Reviewers ({reviewers.length})</h3>
          <div className="space-y-2">
            {reviewers.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-zinc-200/60 px-4 py-3 dark:border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <Avatar src={r.user.avatarUrl} alt={r.user.displayName} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{r.user.displayName}</p>
                    <p className="text-[10px] text-zinc-400">{r.user.email}</p>
                  </div>
                  <div className="flex gap-2 ml-3 text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-zinc-400">Reviewer</span>
                    {r.canCreate && <span className="text-emerald-500/70">Can Create</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-400">Added {new Date(r.createdAt).toLocaleDateString()}</span>
                  <button onClick={() => setRemovingId(r.id)} className="text-[10px] font-bold text-[#FF394A]/70 hover:text-[#FF394A]">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog open={!!removingId} onClose={() => setRemovingId(null)} onConfirm={handleRemove} title="Remove Reviewer?" message="This person will no longer be able to review or create bounty submissions for this region." confirmLabel="Remove" confirmVariant="danger" loading={removing} />
    </div>
  );
}
