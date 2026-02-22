'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';

interface QuestDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xpReward: number;
  difficulty: string;
  requirements: string | null;
  userProgress: string | null;
}

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { data: quest, loading, refetch } = useApi<QuestDetail>(`/api/portal/quests/${id}`);
  const [submission, setSubmission] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await api.post(`/api/portal/quests/${id}/submit`, { content: submission });
    if (res.success) { addToast('success', 'Submission sent!'); setSubmission(''); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setSubmitting(false);
  };

  if (loading) return <AuthGuard><PageLoader /></AuthGuard>;
  if (!quest) return <AuthGuard><div className="py-20 text-center text-zinc-500">Quest not found</div></AuthGuard>;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="info">{quest.category}</Badge>
          <Badge variant={quest.difficulty === 'easy' ? 'success' : quest.difficulty === 'hard' ? 'danger' : 'warning'}>{quest.difficulty}</Badge>
          <Badge variant="success">+{quest.xpReward} XP</Badge>
          {quest.userProgress && <Badge variant={quest.userProgress === 'completed' ? 'success' : 'warning'}>{quest.userProgress}</Badge>}
        </div>

        <h1 className="text-3xl font-bold text-zinc-100">{quest.title}</h1>
        {quest.description && <div className="mt-4 text-zinc-400 whitespace-pre-line">{quest.description}</div>}

        {quest.requirements && (
          <Card className="mt-6">
            <CardTitle>Requirements</CardTitle>
            <div className="mt-2 text-sm text-zinc-400 whitespace-pre-line">{quest.requirements}</div>
          </Card>
        )}

        {quest.userProgress !== 'completed' && (
          <Card className="mt-6">
            <CardTitle>Submit Your Work</CardTitle>
            <div className="mt-4 space-y-4">
              <Textarea value={submission} onChange={(e) => setSubmission(e.target.value)} placeholder="Describe your completion or provide links..." />
              <Button onClick={handleSubmit} loading={submitting}>Submit</Button>
            </div>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}
