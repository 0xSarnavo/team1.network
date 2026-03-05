'use client';

import React, { use } from 'react';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ExternalLink, Megaphone } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  link: string | null;
  audience: string;
  createdAt: string;
  expiresAt: string | null;
  createdBy: { id: string; displayName: string; avatarUrl: string | null };
}

export default function MemberAnnouncementsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: announcements, loading } = useApi<Announcement[]>(`/api/portal/regions/${slug}/announcements`);

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <Megaphone className="h-6 w-6 text-red-500" />
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">Announcements</h1>
      </div>

      {!announcements || announcements.length === 0 ? (
        <EmptyState title="No announcements" description="There are no announcements for your region right now." />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id} className="hover:border-zinc-600 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{a.title}</h2>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        a.audience === 'public' ? 'bg-blue-900/30 text-blue-400' :
                        a.audience === 'member' ? 'bg-amber-900/30 text-amber-400' :
                        'bg-green-900/30 text-green-400'
                      }`}>{a.audience}</span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      by {a.createdBy.displayName} &middot; {new Date(a.createdAt).toLocaleDateString()}
                      {a.expiresAt && <> &middot; expires {new Date(a.expiresAt).toLocaleDateString()}</>}
                    </p>
                  </div>
                  {a.link && (
                    <a href={a.link} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors">
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
