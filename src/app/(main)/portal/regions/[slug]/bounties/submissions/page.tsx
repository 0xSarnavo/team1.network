'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/context/toast-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Submission {
  id: string;
  bountyId: string;
  bountyTitle: string;
  bountyXpReward: number;
  category: string;
  regionId: string | null;
  user: { id: string; displayName: string; username: string | null; avatarUrl: string | null };
  status: string;
  proofUrl: string | null;
  proofText: string | null;
  rejectNote: string | null;
  xpAwarded: number | null;
  submittedAt: string;
  reviewedAt: string | null;
}

interface RegionInfo {
  region: { id: string; name: string; slug: string };
}

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BountySubmissionsReviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToast } = useToast();

  const { data: regionInfo } = useApi<RegionInfo>(`/api/portal/regions/${slug}/manage`);
  const regionId = regionInfo?.region?.id;

  const [statusFilter, setStatusFilter] = useState('pending');

  const { data: submissions, loading, refetch } = useApi<Submission[]>(
    regionId ? `/api/bounty/admin/submissions?regionId=${regionId}&status=${statusFilter}` : '',
    { immediate: !!regionId }
  );

  // Approve
  const { mutate: reviewSubmission, loading: reviewing } = useMutation('put');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<Submission | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Detail modal
  const [detailSubmission, setDetailSubmission] = useState<Submission | null>(null);

  const handleApprove = async (submissionId: string) => {
    setReviewingId(submissionId);
    const res = await reviewSubmission(`/api/bounty/admin/submissions/${submissionId}`, { action: 'approve' });
    if (res.success) {
      addToast('success', 'Submission approved, XP awarded!');
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to approve');
    }
    setReviewingId(null);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    const res = await reviewSubmission(`/api/bounty/admin/submissions/${rejectTarget.id}`, {
      action: 'reject',
      rejectNote: rejectNote || 'Submission does not meet requirements',
    });
    if (res.success) {
      addToast('success', 'Submission rejected');
      setRejectTarget(null);
      setRejectNote('');
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to reject');
    }
    setRejecting(false);
  };

  if (loading || !regionInfo) return <PageLoader />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/portal/regions/${slug}/bounties`} className="mb-3 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300">
          &larr; Back to Bounty Management
        </Link>
        <h1 className="text-3xl font-bold text-zinc-100">Review Submissions</h1>
        <p className="mt-1 text-zinc-500">Review bounty proof submissions for {regionInfo.region.name}</p>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex gap-2">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      {!submissions || submissions.length === 0 ? (
        <EmptyState
          title={`No ${statusFilter} submissions`}
          description={statusFilter === 'pending' ? 'No submissions waiting for review.' : `No ${statusFilter} submissions found.`}
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <Card key={sub.id} className="hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar src={sub.user.avatarUrl} alt={sub.user.displayName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-zinc-200 text-sm">{sub.user.displayName}</span>
                      <Badge variant={STATUS_BADGE[sub.status] || 'default'}>{sub.status}</Badge>
                      <span className="text-xs text-green-400 font-medium">+{sub.bountyXpReward} XP</span>
                    </div>
                    <p className="text-sm text-zinc-400 truncate">Bounty: {sub.bountyTitle}</p>
                    {sub.proofUrl && (
                      <p className="text-xs text-zinc-500 mt-1 truncate">
                        URL: <a href={sub.proofUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">{sub.proofUrl}</a>
                      </p>
                    )}
                    {sub.proofText && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{sub.proofText}</p>
                    )}
                    <span className="text-xs text-zinc-600 mt-1 block">
                      Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setDetailSubmission(sub)}>View</Button>
                  {sub.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={reviewingId === sub.id}
                        onClick={() => handleApprove(sub.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400"
                        onClick={() => setRejectTarget(sub)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!detailSubmission} onClose={() => setDetailSubmission(null)} title="Submission Details" size="lg">
        {detailSubmission && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Bounty</p>
              <p className="text-zinc-200">{detailSubmission.bountyTitle}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Submitter</p>
                <div className="flex items-center gap-2">
                  <Avatar src={detailSubmission.user.avatarUrl} alt={detailSubmission.user.displayName} size="sm" />
                  <span className="text-zinc-200">{detailSubmission.user.displayName}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Status</p>
                <Badge variant={STATUS_BADGE[detailSubmission.status] || 'default'}>{detailSubmission.status}</Badge>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-1">XP Reward</p>
                <span className="text-green-400 font-medium">+{detailSubmission.bountyXpReward} XP</span>
              </div>
            </div>
            {detailSubmission.proofUrl && (
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Proof URL</p>
                <a href={detailSubmission.proofUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline break-all text-sm">
                  {detailSubmission.proofUrl}
                </a>
              </div>
            )}
            {detailSubmission.proofText && (
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Proof Description</p>
                <p className="text-sm text-zinc-300 whitespace-pre-line">{detailSubmission.proofText}</p>
              </div>
            )}
            {detailSubmission.rejectNote && (
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Rejection Reason</p>
                <p className="text-sm text-red-400">{detailSubmission.rejectNote}</p>
              </div>
            )}
            {detailSubmission.xpAwarded && (
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-1">XP Awarded</p>
                <p className="text-green-400 font-bold">+{detailSubmission.xpAwarded} XP</p>
              </div>
            )}
            <p className="text-xs text-zinc-600">
              Submitted: {new Date(detailSubmission.submittedAt).toLocaleString()}
              {detailSubmission.reviewedAt && ` | Reviewed: ${new Date(detailSubmission.reviewedAt).toLocaleString()}`}
            </p>

            {detailSubmission.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
                <Button
                  variant="primary"
                  loading={reviewingId === detailSubmission.id}
                  onClick={() => { handleApprove(detailSubmission.id); setDetailSubmission(null); }}
                >
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => { setRejectTarget(detailSubmission); setDetailSubmission(null); }}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectTarget} onClose={() => { setRejectTarget(null); setRejectNote(''); }} title="Reject Submission" size="md">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Rejecting submission from <span className="text-zinc-200 font-medium">{rejectTarget?.user.displayName}</span> for bounty <span className="text-zinc-200 font-medium">{rejectTarget?.bountyTitle}</span>.
          </p>
          <Textarea
            label="Rejection Reason"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Explain why this submission doesn't meet the requirements..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setRejectTarget(null); setRejectNote(''); }}>Cancel</Button>
            <Button variant="danger" loading={rejecting} onClick={handleReject}>Reject Submission</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
