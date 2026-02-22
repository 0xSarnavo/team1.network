'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/layout/auth-guard';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface Member {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  skills: string[];
  country: string | null;
}

function MembersContent() {
  const searchParams = useSearchParams();
  const region = searchParams.get('region') || '';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: members, loading, pagination } = useApi<Member[]>(
    `/api/portal/members?page=${page}&region=${region}&search=${search}`
  );

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-zinc-100">Members</h1>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members..." className="mb-6 max-w-md" />

        {loading ? <PageLoader /> : !members?.length ? (
          <EmptyState title="No members found" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <Link key={m.id} href={`/profile/${m.username}`}>
                <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar src={m.avatarUrl} alt={m.displayName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-200 truncate">{m.displayName}</p>
                      <p className="text-xs text-zinc-500">@{m.username} &middot; Lvl {m.level}</p>
                    </div>
                  </div>
                  {m.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {m.skills.slice(0, 3).map((s) => <Badge key={s} variant="default">{s}</Badge>)}
                      {m.skills.length > 3 && <Badge variant="default">+{m.skills.length - 3}</Badge>}
                    </div>
                  )}
                  {m.country && <p className="mt-2 text-xs text-zinc-600">{m.country}</p>}
                </Card>
              </Link>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="px-3 py-2 text-sm text-zinc-500">Page {page} of {pagination.totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MembersContent />
    </Suspense>
  );
}
