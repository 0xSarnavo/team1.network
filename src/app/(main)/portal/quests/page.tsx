'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useApi } from '@/lib/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface Quest {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xpReward: number;
  difficulty: string;
  status: string;
  userProgress: string | null;
}

const categories = ['all', 'onboarding', 'weekly', 'community', 'special'];

export default function QuestsPage() {
  const [category, setCategory] = useState('all');
  const { data: quests, loading } = useApi<Quest[]>(`/api/portal/quests?category=${category === 'all' ? '' : category}`);

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-zinc-100">Quests</h1>

        <div className="mb-6 flex gap-2">
          {categories.map((c) => (
            <Button key={c} variant={category === c ? 'primary' : 'ghost'} size="sm" onClick={() => setCategory(c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Button>
          ))}
        </div>

        {loading ? <PageLoader /> : !quests?.length ? (
          <EmptyState title="No quests available" description="Check back later for new quests" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quests.map((q) => (
              <Link key={q.id} href={`/portal/quests/${q.id}`}>
                <Card className="hover:border-zinc-700 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="info">{q.category}</Badge>
                    <Badge variant={q.difficulty === 'easy' ? 'success' : q.difficulty === 'hard' ? 'danger' : 'warning'}>{q.difficulty}</Badge>
                  </div>
                  <h3 className="font-semibold text-zinc-200">{q.title}</h3>
                  {q.description && <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{q.description}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="success">+{q.xpReward} XP</Badge>
                    {q.userProgress && <Badge variant={q.userProgress === 'completed' ? 'success' : 'warning'}>{q.userProgress}</Badge>}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
