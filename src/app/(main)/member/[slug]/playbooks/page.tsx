'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, FileText } from 'lucide-react';

interface Playbook {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  visibility: string;
  createdAt: string;
}

export default function MemberPlaybooksPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [search, setSearch] = useState('');
  const { data: playbooks, loading } = useApi<Playbook[]>(
    `/api/portal/regions/${slug}/playbooks?search=${search}`
  );

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">Playbooks</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search playbooks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 sm:w-64"
          />
        </div>
      </div>

      {!playbooks || playbooks.length === 0 ? (
        <EmptyState title="No playbooks" description="No playbooks available for this region yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((p) => (
            <Link key={p.id} href={`/member/${slug}/playbooks/${p.id}`}>
              <Card className="h-full hover:border-zinc-600 transition-colors">
                {p.coverImageUrl && (
                  <img src={p.coverImageUrl} alt={p.title} className="h-40 w-full rounded-t-lg object-cover" />
                )}
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.visibility === 'public' ? 'bg-blue-900/30 text-blue-400' : 'bg-amber-900/30 text-amber-400'
                    }`}>{p.visibility}</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 line-clamp-2">{p.title}</h3>
                  {p.description && <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{p.description}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
