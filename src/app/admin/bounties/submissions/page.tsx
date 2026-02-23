'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/context/toast-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubmissionItem {
  id: string;
  bountyId: string;
  proofUrl: string | null;
  proofText: string | null;
  status: string;
  xpAwarded: number | null;
  rejectNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  bounty: {
    id: string;
    title: string;
    xpReward: number;
    category: string;
  };
  user: {
    id: string;
    displayName: string;
    email: string;
    username: string | null;
    avatarUrl: string | null;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: '', label: 'All' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminBountySubmissionsPage() {
  const { addToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('pending');

  const queryParams = new URLSearchParams();
  queryParams.set('limit', '50');
  if (statusFilter) queryParams.set('status', statusFilter);

  const { data: submissions, loading, refetch } = useApi<SubmissionItem[]>(
    `/api/admin/bounties/submissions?${queryParams.toString()}`
  );

  // Detail modal
  const [selected, setSelected] = useState<SubmissionItem | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const { mutate: reviewSubmission, loading: reviewing } = useMutation('put');

  const handleApprove = async (submissionId: string) => {
    const res = await reviewSubmission(`/api/admin/bounties/submissions/${submissionId}`, {
      action: 'approve',
    });
    if (res.success) {
      addToast('success', 'Submission approved and XP awarded');
      setSelected(null);
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to approve');
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!rejectNote.trim()) {
      addToast('error', 'Please provide a reason for rejection');
      return;
    }
    const res = await reviewSubmission(`/api/admin/bounties/submissions/${submissionId}`, {
      action: 'reject',
      rejectNote: rejectNote.trim(),
    });
    if (res.success) {
      addToast('success', 'Submission rejected');
      setSelected(null);
      setRejectNote('');
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to reject');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Bounty Submissions</h1>
            <p className="mt-1 text-zinc-500">Review and manage all bounty submissions across the platform.</p>
          </div>
          <Link href="/admin/bounties">
            <Button variant="outline">Manage Bounties</Button>
          </Link>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {!submissions || submissions.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter || ''} submissions`}
          description={statusFilter === 'pending' ? 'All submissions have been reviewed.' : 'No submissions found with this filter.'}
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} onClick={() => { setSelected(s); setRejectNote(''); }} className="cursor-pointer">
            <Card className="hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar src={s.user.avatarUrl} alt={s.user.displayName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-zinc-200">{s.user.displayName}</p>
                      <span className="text-xs text-zinc-500">{s.user.email}</span>
                    </div>
                    <p className="text-sm text-zinc-300 truncate">{s.bounty.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant={STATUS_BADGE[s.status] || 'default'}>{s.status}</Badge>
                      <Badge variant="default">{s.bounty.category}</Badge>
                      <span className="text-xs text-green-400">+{s.bounty.xpReward} XP</span>
                      <span className="text-xs text-zinc-600">{new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {s.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleApprove(s.id); }}
                      loading={reviewing}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setSelected(s); setRejectNote(''); }}
                    >
                      Review
                    </Button>
                  </div>
                )}
              </div>
            </Card>
            </div>
          ))}
        </div>
      )}

      {/* Detail / Review Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Submission Detail"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            {/* Submitter info */}
            <div className="flex items-center gap-3">
              <Avatar src={selected.user.avatarUrl} alt={selected.user.displayName} size="md" />
              <div>
                <p className="font-medium text-zinc-200">{selected.user.displayName}</p>
                <p className="text-sm text-zinc-500">{selected.user.email}</p>
              </div>
              <Badge variant={STATUS_BADGE[selected.status] || 'default'} className="ml-auto">
                {selected.status}
              </Badge>
            </div>

            {/* Bounty info */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <p className="text-sm font-medium text-zinc-300">{selected.bounty.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">{selected.bounty.category}</Badge>
                <span className="text-xs text-green-400">+{selected.bounty.xpReward} XP</span>
              </div>
            </div>

            {/* Proof */}
            <div>
              <p className="text-xs font-medium uppercase text-zinc-500 mb-1">Proof Submitted</p>
              {selected.proofUrl && (
                <a
                  href={selected.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-400 hover:text-red-300 break-all"
                >
                  {selected.proofUrl}
                </a>
              )}
              {selected.proofText && (
                <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">{selected.proofText}</p>
              )}
              {!selected.proofUrl && !selected.proofText && (
                <p className="text-sm text-zinc-500 italic">No proof provided</p>
              )}
            </div>

            {/* Submission date */}
            <p className="text-xs text-zinc-600">
              Submitted: {new Date(selected.createdAt).toLocaleString()}
              {selected.reviewedAt && ` | Reviewed: ${new Date(selected.reviewedAt).toLocaleString()}`}
            </p>

            {/* Rejection note (if already rejected) */}
            {selected.status === 'rejected' && selected.rejectNote && (
              <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-3">
                <p className="text-xs font-medium uppercase text-red-400 mb-1">Rejection Reason</p>
                <p className="text-sm text-zinc-300">{selected.rejectNote}</p>
              </div>
            )}

            {/* XP awarded (if approved) */}
            {selected.status === 'approved' && selected.xpAwarded && (
              <div className="rounded-lg border border-green-900/50 bg-green-900/10 p-3">
                <p className="text-sm text-green-400 font-medium">+{selected.xpAwarded} XP awarded</p>
              </div>
            )}

            {/* Actions for pending */}
            {selected.status === 'pending' && (
              <div className="border-t border-zinc-800 pt-4 space-y-3">
                <Textarea
                  label="Rejection Note (required to reject)"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Explain why this submission is being rejected..."
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => handleReject(selected.id)}
                    loading={reviewing}
                    className="text-red-400"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(selected.id)}
                    loading={reviewing}
                  >
                    Approve (+{selected.bounty.xpReward} XP)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
