'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';

interface ProposalDetail {
  id: string;
  title: string;
  description: string;
  stage: string;
  createdAt: string;
  createdBy: { id: string; displayName: string; avatarUrl: string | null };
  comments: {
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; displayName: string; avatarUrl: string | null };
  }[];
}

const STAGE_COLORS: Record<string, string> = {
  proposed: 'bg-blue-900/30 text-blue-400',
  discussion: 'bg-amber-900/30 text-amber-400',
  approved: 'bg-green-900/30 text-green-400',
  rejected: 'bg-red-900/30 text-red-400',
};

export default function ProposalDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = use(params);
  const { user } = useAuth();
  const { data: proposal, loading, refetch } = useApi<ProposalDetail>(`/api/portal/regions/${slug}/proposals/${id}`);
  const { mutate: post, loading: commenting } = useMutation<unknown>('post');
  const [comment, setComment] = useState('');

  const handleComment = async () => {
    if (!comment.trim()) return;
    const res = await post(`/api/portal/regions/${slug}/proposals/${id}/comments`, { body: comment });
    if (res.success) {
      setComment('');
      refetch();
    }
  };

  if (loading || !proposal) return <PageLoader />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href={`/member/${slug}/proposals`} className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300">
        <ArrowLeft className="h-4 w-4" /> Back to Proposals
      </Link>

      {/* Proposal Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STAGE_COLORS[proposal.stage]}`}>{proposal.stage}</span>
        </div>
        <h1 className="mb-4 text-3xl font-black text-zinc-900 dark:text-zinc-50">{proposal.title}</h1>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <Avatar src={proposal.createdBy.avatarUrl} alt={proposal.createdBy.displayName} size="sm" className="h-6 w-6" />
          <span className="font-medium text-zinc-300">{proposal.createdBy.displayName}</span>
          <span>&middot;</span>
          <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Proposal Body */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
            {proposal.description}
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-zinc-500" />
        <h2 className="text-lg font-bold text-zinc-100">Comments ({proposal.comments.length})</h2>
      </div>

      <div className="space-y-4 mb-8">
        {proposal.comments.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-6">No comments yet.</p>
        ) : (
          proposal.comments.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar src={c.author.avatarUrl} alt={c.author.displayName} size="sm" className="h-6 w-6" />
                  <span className="text-sm font-semibold text-zinc-200">{c.author.displayName}</span>
                  <span className="text-xs text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap">{c.body}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Comment Form */}
      {proposal.stage === 'discussion' ? (
        <Card>
          <CardContent className="p-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            />
            <div className="flex justify-end">
              <button
                onClick={handleComment}
                disabled={commenting || !comment.trim()}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> {commenting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-center text-sm text-zinc-500">
          {proposal.stage === 'proposed' ? 'Comments will be available once the proposal enters discussion.' :
           `This proposal has been ${proposal.stage}. Comments are closed.`}
        </p>
      )}
    </div>
  );
}
