'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { useToast } from '@/lib/context/toast-context';
import { useAuth } from '@/lib/context/auth-context';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';

interface BountyDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  type: string;
  regionId: string | null;
  region: { id: string; name: string; slug: string } | null;
  status: string;
  maxSubmissions: number | null;
  startsAt: string | null;
  endsAt: string | null;
  proofRequirements: string | null;
  submissionCount: number;
  mySubmissions: {
    id: string;
    status: string;
    proofUrl: string | null;
    proofText: string | null;
    rejectNote: string | null;
    xpAwarded: number | null;
    createdAt: string;
  }[];
  creator: { id: string; displayName: string; avatarUrl: string | null };
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  development: 'info',
  security: 'danger',
  content: 'success',
  translation: 'info',
  design: 'warning',
  community: 'info',
};

const TYPE_LABELS: Record<string, string> = {
  one_time: 'One-time',
  recurring_weekly: 'Recurring Weekly',
  recurring_monthly: 'Recurring Monthly',
};

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export default function BountyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { data: bounty, loading, refetch } = useApi<BountyDetail>(`/api/bounty/${id}`);
  const { mutate: submitProof, loading: submitting } = useMutation('post');

  const [proofUrl, setProofUrl] = useState('');
  const [proofText, setProofText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl && !proofText) {
      addToast('error', 'Please provide a proof URL or description');
      return;
    }

    const res = await submitProof(`/api/bounty/${id}/submit`, {
      proofUrl: proofUrl || undefined,
      proofText: proofText || undefined,
    });

    if (res.success) {
      addToast('success', 'Proof submitted successfully!');
      setProofUrl('');
      setProofText('');
      refetch();
    } else {
      addToast('error', res.error?.message || 'Submission failed');
    }
  };

  if (loading) return <PageLoader />;
  if (!bounty) return <div className="py-20 text-center text-zinc-500">Bounty not found</div>;

  const isActive = bounty.status === 'active';
  const isExpired = bounty.endsAt ? new Date(bounty.endsAt) < new Date() : false;
  const isFull = bounty.maxSubmissions ? bounty.submissionCount >= bounty.maxSubmissions : false;
  const hasOneTimeSubmission = bounty.type === 'one_time' && bounty.mySubmissions.length > 0;
  const canSubmit = isActive && !isExpired && !isFull && !hasOneTimeSubmission && user;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <Link href="/bounty" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Bounty Board
      </Link>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={(CATEGORY_COLORS[bounty.category] as any) || 'default'}>{bounty.category}</Badge>
        <Badge variant="success">+{bounty.xpReward} XP</Badge>
        <Badge variant="default">{TYPE_LABELS[bounty.type] || bounty.type}</Badge>
        {bounty.region && <Badge variant="info">{bounty.region.name}</Badge>}
        {!isActive && <Badge variant="danger">{bounty.status}</Badge>}
        {isExpired && <Badge variant="danger">Expired</Badge>}
        {isFull && <Badge variant="warning">Max submissions reached</Badge>}
      </div>

      {/* Title + Description */}
      <h1 className="text-3xl font-bold text-zinc-100 mb-2">{bounty.title}</h1>
      <div className="flex items-center gap-3 text-sm text-zinc-500 mb-6">
        <span>Posted {new Date(bounty.createdAt).toLocaleDateString()}</span>
        {bounty.creator && <span>by {bounty.creator.displayName}</span>}
        <span>{bounty.submissionCount} submission{bounty.submissionCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="text-zinc-300 whitespace-pre-line mb-8 leading-relaxed">{bounty.description}</div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center">
          <div className="text-lg font-bold text-green-400">+{bounty.xpReward}</div>
          <div className="text-xs text-zinc-500">XP Reward</div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center">
          <div className="text-lg font-bold text-zinc-100">{bounty.submissionCount}</div>
          <div className="text-xs text-zinc-500">Submissions</div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center">
          <div className="text-lg font-bold text-zinc-100">{bounty.maxSubmissions || '\u221E'}</div>
          <div className="text-xs text-zinc-500">Max Slots</div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-center">
          <div className="text-lg font-bold text-zinc-100">
            {bounty.endsAt ? new Date(bounty.endsAt).toLocaleDateString() : 'Open'}
          </div>
          <div className="text-xs text-zinc-500">Deadline</div>
        </div>
      </div>

      {/* Proof requirements */}
      {bounty.proofRequirements && (
        <Card className="mb-8">
          <CardTitle>Proof Requirements</CardTitle>
          <div className="mt-2 text-sm text-zinc-400 whitespace-pre-line">{bounty.proofRequirements}</div>
        </Card>
      )}

      {/* My previous submissions */}
      {bounty.mySubmissions.length > 0 && (
        <Card className="mb-8">
          <CardTitle>My Submissions</CardTitle>
          <div className="mt-4 space-y-3">
            {bounty.mySubmissions.map((sub) => (
              <div key={sub.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={STATUS_BADGE[sub.status] || 'default'}>{sub.status}</Badge>
                  <span className="text-xs text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</span>
                </div>
                {sub.proofUrl && (
                  <p className="text-sm text-zinc-400 mb-1">
                    <span className="text-zinc-500">URL:</span>{' '}
                    <a href={sub.proofUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline break-all">{sub.proofUrl}</a>
                  </p>
                )}
                {sub.proofText && (
                  <p className="text-sm text-zinc-400 mb-1">
                    <span className="text-zinc-500">Description:</span> {sub.proofText}
                  </p>
                )}
                {sub.status === 'approved' && sub.xpAwarded && (
                  <p className="text-sm text-green-400 font-medium mt-1">+{sub.xpAwarded} XP awarded</p>
                )}
                {sub.status === 'rejected' && sub.rejectNote && (
                  <p className="text-sm text-red-400 mt-1">
                    <span className="text-zinc-500">Reason:</span> {sub.rejectNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Submit proof form */}
      {canSubmit ? (
        <Card>
          <CardTitle>Submit Your Proof</CardTitle>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Input
              label="Proof URL (link to your work)"
              placeholder="https://github.com/your-repo or https://example.com/proof"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
            />
            <Textarea
              label="Description"
              placeholder="Describe what you did and how it meets the bounty requirements..."
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
            />
            <Button type="submit" loading={submitting}>
              Submit Proof
            </Button>
          </form>
        </Card>
      ) : !user ? (
        <Card className="text-center">
          <p className="text-zinc-400 mb-4">Sign in to submit proof for this bounty.</p>
          <Link href="/auth/login">
            <Button variant="primary">Sign In</Button>
          </Link>
        </Card>
      ) : hasOneTimeSubmission ? (
        <Card className="text-center">
          <p className="text-zinc-400">You have already submitted proof for this one-time bounty.</p>
        </Card>
      ) : null}
    </div>
  );
}
