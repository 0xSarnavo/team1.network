'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface Guide {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  category: string | null;
  readTime: number | null;
}

export default function GuidesPage() {
  const [search, setSearch] = useState('');
  const { data: guides, loading } = useApi<Guide[]>(`/api/portal/guides?search=${search}`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Guides</h1>
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guides..." className="mb-6 max-w-md" />

      {loading ? <PageLoader /> : !guides?.length ? (
        <EmptyState title="No guides found" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <Link key={g.id} href={`/portal/guides/${g.slug}`}>
              <Card className="hover:border-zinc-700 transition-colors cursor-pointer h-full">
                {g.category && <Badge variant="default" className="mb-2">{g.category}</Badge>}
                <h3 className="font-semibold text-zinc-200">{g.title}</h3>
                {g.summary && <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{g.summary}</p>}
                {g.readTime && <p className="mt-2 text-xs text-zinc-600">{g.readTime} min read</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
