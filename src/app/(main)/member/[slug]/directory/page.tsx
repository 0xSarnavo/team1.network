'use client';

import React, { use, useState } from 'react';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, Users, Mail } from 'lucide-react';

interface MemberEntry {
  id: string;
  role: string;
  user: {
    id: string;
    displayName: string;
    username: string | null;
    avatarUrl: string | null;
    email: string;
    title: string | null;
    bio: string | null;
    socialLinks: { platform: string; handle: string; url: string | null }[];
  };
}

export default function MemberDirectoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [search, setSearch] = useState('');
  const { data: members, loading } = useApi<MemberEntry[]>(
    `/api/portal/regions/${slug}/members?search=${search}`
  );

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">Member Directory</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 sm:w-64"
          />
        </div>
      </div>

      {!members || members.length === 0 ? (
        <EmptyState title="No members found" description={search ? 'Try a different search term.' : 'No accepted members in this region yet.'} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <Card key={m.id} className="hover:border-zinc-600 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={m.user.avatarUrl} alt={m.user.displayName} size="md" className="h-10 w-10" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-zinc-100 truncate">{m.user.displayName}</p>
                    {m.user.username && <p className="text-xs text-zinc-500">@{m.user.username}</p>}
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                    {m.role}
                  </span>
                </div>
                {m.user.title && <p className="mb-1 text-xs font-medium text-zinc-300">{m.user.title}</p>}
                {m.user.bio && <p className="mb-3 text-xs text-zinc-500 line-clamp-2">{m.user.bio}</p>}
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <a href={`mailto:${m.user.email}`} className="flex items-center gap-1 hover:text-zinc-300">
                    <Mail className="h-3 w-3" /> {m.user.email}
                  </a>
                </div>
                {m.user.socialLinks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.user.socialLinks.map(s => (
                      <a key={s.platform} href={s.url || '#'} target="_blank" rel="noopener noreferrer" className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 hover:text-zinc-200">
                        {s.platform}: {s.handle}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
