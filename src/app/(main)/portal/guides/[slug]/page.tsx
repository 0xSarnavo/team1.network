'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';

interface GuideDetail {
  id: string;
  title: string;
  content: string;
  category: string | null;
  readTime: number | null;
  relatedGuides: { id: string; title: string; slug: string }[];
}

export default function GuideDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: guide, loading } = useApi<GuideDetail>(`/api/portal/guides/${slug}`);

  if (loading) return <PageLoader />;
  if (!guide) return <div className="py-20 text-center text-zinc-500">Guide not found</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {guide.category && <Badge variant="default" className="mb-3">{guide.category}</Badge>}
      <h1 className="text-3xl font-bold text-zinc-100">{guide.title}</h1>
      {guide.readTime && <p className="mt-1 text-sm text-zinc-600">{guide.readTime} min read</p>}
      <div className="mt-8 prose prose-invert max-w-none text-zinc-300 whitespace-pre-line">{guide.content}</div>

      {guide.relatedGuides?.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-zinc-100">Related Guides</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {guide.relatedGuides.map((g) => (
              <Link key={g.id} href={`/portal/guides/${g.slug}`}>
                <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
                  <p className="font-medium text-zinc-200">{g.title}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
