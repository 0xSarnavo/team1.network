'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { useToast } from '@/lib/context/toast-context';
import { useAuth } from '@/lib/context/auth-context';
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

const TYPE_LABELS: Record<string, string> = {
  one_time: 'One-time',
  recurring_weekly: 'Recurring Weekly',
  recurring_monthly: 'Recurring Monthly',
};

function StatusLabel({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${colors[status] || 'text-zinc-400'}`}>
      {status}
    </span>
  );
}

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
  if (!bounty) return <div className="py-20 text-center text-sm text-zinc-400">Bounty not found</div>;

  const isActive = bounty.status === 'active';
  const isExpired = bounty.endsAt ? new Date(bounty.endsAt) < new Date() : false;
  const isFull = bounty.maxSubmissions ? bounty.submissionCount >= bounty.maxSubmissions : false;
  const hasOneTimeSubmission = bounty.type === 'one_time' && bounty.mySubmissions.length > 0;
  const canSubmit = isActive && !isExpired && !isFull && !hasOneTimeSubmission && user;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      {/* Back */}
      <Link href="/bounty" className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        Back to Bounties
      </Link>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Image placeholder */}
          <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 md:h-56">
            <svg className="h-12 w-12 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>

          {/* Meta tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-zinc-200 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:border-zinc-800">{bounty.category}</span>
            <span className="rounded-full bg-[#FF394A]/10 px-3 py-0.5 text-[10px] font-bold text-[#FF394A]">+{bounty.xpReward} XP</span>
            <span className="rounded-full border border-zinc-200 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:border-zinc-800">{TYPE_LABELS[bounty.type] || bounty.type}</span>
            {bounty.region && (
              <span className="rounded-full border border-zinc-200 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:border-zinc-800">{bounty.region.name}</span>
            )}
            {!isActive && <span className="rounded-full bg-rose-500/10 px-3 py-0.5 text-[10px] font-bold text-rose-500">{bounty.status}</span>}
            {isExpired && <span className="rounded-full bg-rose-500/10 px-3 py-0.5 text-[10px] font-bold text-rose-500">Expired</span>}
            {isFull && <span className="rounded-full bg-amber-500/10 px-3 py-0.5 text-[10px] font-bold text-amber-500">Full</span>}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl">{bounty.title}</h1>

          {/* Creator + date */}
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>Posted {new Date(bounty.createdAt).toLocaleDateString()}</span>
            {bounty.creator && <span>by {bounty.creator.displayName}</span>}
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-3">Description</h3>
            <div className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">{bounty.description}</div>
          </div>

          {/* Proof requirements */}
          {bounty.proofRequirements && (
            <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-3">Proof Requirements</h3>
              <div className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-pre-line">{bounty.proofRequirements}</div>
            </div>
          )}

          {/* My previous submissions */}
          {bounty.mySubmissions.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">My Submissions</h3>
              <div className="space-y-3">
                {bounty.mySubmissions.map((sub) => (
                  <div key={sub.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <StatusLabel status={sub.status} />
                      <span className="text-[10px] text-zinc-400">{new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                    {sub.proofUrl && (
                      <p className="text-sm text-zinc-500 mb-1">
                        <span className="text-zinc-400">URL:</span>{' '}
                        <a href={sub.proofUrl} target="_blank" rel="noopener noreferrer" className="text-[#FF394A] hover:underline break-all">{sub.proofUrl}</a>
                      </p>
                    )}
                    {sub.proofText && (
                      <p className="text-sm text-zinc-500 mb-1">
                        <span className="text-zinc-400">Description:</span> {sub.proofText}
                      </p>
                    )}
                    {sub.status === 'approved' && sub.xpAwarded && (
                      <p className="text-xs font-bold text-[#FF394A] mt-1">+{sub.xpAwarded} XP awarded</p>
                    )}
                    {sub.status === 'rejected' && sub.rejectNote && (
                      <p className="text-xs text-rose-500 mt-1">
                        <span className="text-zinc-400">Reason:</span> {sub.rejectNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit proof form */}
          {canSubmit ? (
            <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">Submit Your Proof</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Proof URL"
                  placeholder="https://github.com/your-repo or https://example.com/proof"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="rounded-xl border-zinc-200 bg-transparent dark:border-zinc-800"
                />
                <Textarea
                  label="Description"
                  placeholder="Describe what you did and how it meets the bounty requirements..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  className="rounded-xl border-zinc-200 bg-transparent dark:border-zinc-800"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-full bg-[#FF394A] px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Proof'}
                </button>
              </form>
            </div>
          ) : !user ? (
            <div className="rounded-2xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
              <p className="text-sm text-zinc-500 mb-4">Sign in to submit proof for this bounty.</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:bg-[#FF394A] hover:text-white hover:border-[#FF394A] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-[#FF394A] dark:hover:text-white dark:hover:border-[#FF394A] active:scale-95"
              >
                Sign In
              </Link>
            </div>
          ) : hasOneTimeSubmission ? (
            <div className="rounded-2xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
              <p className="text-sm text-zinc-500">You have already submitted proof for this one-time bounty.</p>
            </div>
          ) : null}
        </div>

        {/* Sidebar — Stats */}
        <div className="space-y-5">
          {/* Stats card */}
          <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">Details</h3>
            <div className="space-y-3">
              {[
                { label: 'XP Reward', value: `+${bounty.xpReward}`, accent: true },
                { label: 'Submissions', value: String(bounty.submissionCount) },
                { label: 'Max Slots', value: bounty.maxSubmissions ? String(bounty.maxSubmissions) : '∞' },
                { label: 'Deadline', value: bounty.endsAt ? new Date(bounty.endsAt).toLocaleDateString() : 'Open' },
                { label: 'Type', value: TYPE_LABELS[bounty.type] || bounty.type },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between border-b border-zinc-100 pb-2.5 last:border-0 last:pb-0 dark:border-zinc-800/50">
                  <span className="text-xs text-zinc-400">{stat.label}</span>
                  <span className={`text-sm font-bold ${stat.accent ? 'text-[#FF394A]' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick apply */}
          {canSubmit && (
            <button
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              className="block w-full rounded-xl bg-[#FF394A] py-3 text-center text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Submit Proof
            </button>
          )}

          {/* Creator */}
          {bounty.creator && (
            <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-3">Posted By</h3>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{bounty.creator.displayName}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{new Date(bounty.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
