'use client';

import React from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface Program {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  hasApplied: boolean;
}

export default function ProgramsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: programs, loading, refetch } = useApi<Program[]>('/api/portal/programs');

  const handleApply = async (programId: string) => {
    if (!user) { addToast('error', 'Please sign in to apply'); return; }
    const res = await api.post(`/api/portal/programs/${programId}/apply`);
    if (res.success) { addToast('success', 'Application submitted!'); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Programs</h1>

      {loading ? <PageLoader /> : !programs?.length ? (
        <EmptyState title="No programs available" description="Check back later for new programs" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={p.status === 'active' ? 'success' : p.status === 'upcoming' ? 'info' : 'default'}>{p.status}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">{p.title}</h3>
              {p.description && <p className="mt-1 text-sm text-zinc-500 line-clamp-3">{p.description}</p>}
              {(p.startDate || p.endDate) && (
                <p className="mt-2 text-xs text-zinc-600">
                  {p.startDate && new Date(p.startDate).toLocaleDateString()}
                  {p.endDate && ` — ${new Date(p.endDate).toLocaleDateString()}`}
                </p>
              )}
              <div className="mt-4">
                {p.hasApplied ? (
                  <Badge variant="success">Applied</Badge>
                ) : (
                  <Button size="sm" onClick={() => handleApply(p.id)}>Apply</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
