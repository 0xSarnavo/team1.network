'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/context/toast-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';

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

  const { mutate: reviewSubmission, loading: reviewing } = useMutation('put');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = useState<Submission | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const [detailSubmission, setDetailSubmission] = useState<Submission | null>(null);

  const handleApprove = async (submissionId: string) => {
    setReviewingId(submissionId);
    const res = await reviewSubmission(`/api/bounty/admin/submissions/${submissionId}`, { action: 'approve' });
    if (res.success) { addToast('success', 'Submission approved, XP awarded!'); refetch(); }
    else addToast('error', res.error?.message || 'Failed to approve');
    setReviewingId(null);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    const res = await reviewSubmission(`/api/bounty/admin/submissions/${rejectTarget.id}`, {
      action: 'reject', rejectNote: rejectNote || 'Submission does not meet requirements',
    });
    if (res.success) { addToast('success', 'Submission rejected'); setRejectTarget(null); setRejectNote(''); refetch(); }
    else addToast('error', res.error?.message || 'Failed to reject');
    setRejecting(false);
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
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Review Submissions</h1>
        <p className="mt-1 text-sm text-zinc-500">Review bounty proof submissions for {regionInfo.region.name}</p>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex gap-1">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              statusFilter === s
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            {s}
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
        <div className="space-y-2">
          {submissions.map((sub) => (
            <div key={sub.id} className="rounded-2xl border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar src={sub.user.avatarUrl} alt={sub.user.displayName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-zinc-900 dark:text-zinc-100">{sub.user.displayName}</span>
                      <span className={sub.status === 'approved' ? 'text-emerald-500/70' : sub.status === 'rejected' ? 'text-rose-500/70' : 'text-amber-500/70'}>{sub.status}</span>
                      <span className="text-[#FF394A]">+{sub.bountyXpReward} XP</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">Bounty: {sub.bountyTitle}</p>
                    {sub.proofUrl && (
                      <p className="text-[10px] text-zinc-400 mt-1 truncate">
                        URL: <a href={sub.proofUrl} target="_blank" rel="noopener noreferrer" className="text-[#FF394A] hover:underline">{sub.proofUrl}</a>
                      </p>
                    )}
                    {sub.proofText && <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{sub.proofText}</p>}
                    <span className="text-[10px] text-zinc-400 mt-1 block">Submitted {new Date(sub.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setDetailSubmission(sub)} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">View</button>
                  {sub.status === 'pending' && (
                    <>
                      <button
                        disabled={reviewingId === sub.id}
                        onClick={() => handleApprove(sub.id)}
                        className="rounded-full bg-zinc-900 px-4 py-1 text-[10px] font-bold text-white transition-all hover:opacity-90 dark:bg-white dark:text-zinc-900 disabled:opacity-50 active:scale-95"
                      >
                        Approve
                      </button>
                      <button onClick={() => setRejectTarget(sub)} className="text-[10px] font-bold text-[#FF394A]/70 hover:text-[#FF394A]">Reject</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!detailSubmission} onClose={() => setDetailSubmission(null)} title="Submission Details" size="lg">
        {detailSubmission && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Bounty</p>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{detailSubmission.bountyTitle}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Submitter</p>
                <div className="flex items-center gap-2">
                  <Avatar src={detailSubmission.user.avatarUrl} alt={detailSubmission.user.displayName} size="sm" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{detailSubmission.user.displayName}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Status</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${detailSubmission.status === 'approved' ? 'text-emerald-500/70' : detailSubmission.status === 'rejected' ? 'text-rose-500/70' : 'text-amber-500/70'}`}>{detailSubmission.status}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">XP Reward</p>
                <span className="text-xs font-bold text-[#FF394A]">+{detailSubmission.bountyXpReward} XP</span>
              </div>
            </div>
            {detailSubmission.proofUrl && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Proof URL</p>
                <a href={detailSubmission.proofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#FF394A] hover:underline break-all">{detailSubmission.proofUrl}</a>
              </div>
            )}
            {detailSubmission.proofText && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Proof Description</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-line">{detailSubmission.proofText}</p>
              </div>
            )}
            {detailSubmission.rejectNote && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Rejection Reason</p>
                <p className="text-sm text-rose-500/70">{detailSubmission.rejectNote}</p>
              </div>
            )}
            {detailSubmission.xpAwarded && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">XP Awarded</p>
                <p className="text-sm font-black text-[#FF394A]">+{detailSubmission.xpAwarded} XP</p>
              </div>
            )}
            <p className="text-[10px] text-zinc-400">
              Submitted: {new Date(detailSubmission.submittedAt).toLocaleString()}
              {detailSubmission.reviewedAt && ` | Reviewed: ${new Date(detailSubmission.reviewedAt).toLocaleString()}`}
            </p>

            {detailSubmission.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <Button
                  loading={reviewingId === detailSubmission.id}
                  onClick={() => { handleApprove(detailSubmission.id); setDetailSubmission(null); }}
                >
                  Approve
                </Button>
                <button
                  onClick={() => { setRejectTarget(detailSubmission); setDetailSubmission(null); }}
                  className="text-xs font-bold text-[#FF394A]/70 hover:text-[#FF394A]"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectTarget} onClose={() => { setRejectTarget(null); setRejectNote(''); }} title="Reject Submission" size="md">
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Rejecting submission from <span className="font-bold text-zinc-900 dark:text-zinc-100">{rejectTarget?.user.displayName}</span> for bounty <span className="font-bold text-zinc-900 dark:text-zinc-100">{rejectTarget?.bountyTitle}</span>.
          </p>
          <Textarea
            label="Rejection Reason"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Explain why this submission doesn't meet the requirements..."
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => { setRejectTarget(null); setRejectNote(''); }} className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Cancel</button>
            <button onClick={handleReject} disabled={rejecting} className="rounded-full bg-[#FF394A] px-5 py-2 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 active:scale-95">
              {rejecting ? 'Rejecting...' : 'Reject Submission'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
