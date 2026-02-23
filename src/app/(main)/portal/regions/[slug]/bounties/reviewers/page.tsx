'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/context/toast-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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

  // Add reviewer
  const [addEmail, setAddEmail] = useState('');
  const [canCreate, setCanCreate] = useState(false);
  const { mutate: addReviewer, loading: adding } = useMutation('post');

  // Remove reviewer
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { mutate: removeReviewer, loading: removing } = useMutation('delete');

  const handleAdd = async () => {
    const email = addEmail.trim();
    if (!email || !regionId) {
      addToast('error', 'Please enter an email address');
      return;
    }
    const res = await addReviewer('/api/bounty/admin/reviewers', {
      regionId,
      email,
      canCreate,
    });
    if (res.success) {
      addToast('success', 'Reviewer added');
      setAddEmail('');
      setCanCreate(false);
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to add reviewer');
    }
  };

  const handleRemove = async () => {
    if (!removingId) return;
    const res = await removeReviewer(`/api/bounty/admin/reviewers?id=${removingId}`);
    if (res.success) {
      addToast('success', 'Reviewer removed');
      setRemovingId(null);
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to remove reviewer');
    }
  };

  if (loading || !regionInfo) return <PageLoader />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/portal/regions/${slug}/bounties`} className="mb-3 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300">
          &larr; Back to Bounty Management
        </Link>
        <h1 className="text-3xl font-bold text-zinc-100">Manage Reviewers</h1>
        <p className="mt-1 text-zinc-500">
          Delegate bounty review access to trusted members of {regionInfo.region.name}.
          Reviewers can approve or reject bounty submissions. Optionally give them create access too.
        </p>
      </div>

      {/* Add Reviewer */}
      <Card className="mb-8">
        <CardTitle>Add Reviewer</CardTitle>
        <p className="mt-1 text-sm text-zinc-500">Enter the email of a platform user to grant them reviewer access.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Email"
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            placeholder="user@example.com"
            className="sm:max-w-xs"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={canCreate}
              onChange={(e) => setCanCreate(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-900 text-red-500 focus:ring-red-500"
            />
            Can also create bounties
          </label>
          <Button loading={adding} onClick={handleAdd}>
            Add Reviewer
          </Button>
        </div>
      </Card>

      {/* Reviewer list */}
      {!reviewers || reviewers.length === 0 ? (
        <EmptyState
          title="No reviewers yet"
          description="Region leads automatically have reviewer access. Add more reviewers to delegate submission review."
        />
      ) : (
        <Card>
          <CardTitle>Current Reviewers ({reviewers.length})</CardTitle>
          <div className="mt-4 space-y-3">
            {reviewers.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar src={r.user.avatarUrl} alt={r.user.displayName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{r.user.displayName}</p>
                    <p className="text-xs text-zinc-500">{r.user.email}</p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <Badge variant="info">Reviewer</Badge>
                    {r.canCreate && <Badge variant="success">Can Create</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600">Added {new Date(r.createdAt).toLocaleDateString()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => setRemovingId(r.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Remove Confirm */}
      <ConfirmDialog
        open={!!removingId}
        onClose={() => setRemovingId(null)}
        onConfirm={handleRemove}
        title="Remove Reviewer?"
        message="This person will no longer be able to review or create bounty submissions for this region."
        confirmLabel="Remove"
        confirmVariant="danger"
        loading={removing}
      />
    </div>
  );
}
