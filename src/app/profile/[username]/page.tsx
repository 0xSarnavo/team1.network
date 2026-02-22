'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useApi } from '@/lib/hooks/use-api';

interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  coverPhotoUrl: string | null;
  bio: string | null;
  title: string | null;
  level: number;
  totalXp: number;
  country: string | null;
  city: string | null;
  skills: { name: string }[];
  interests: { name: string }[];
  roles: { name: string }[];
  socialLinks: { platform: string; url: string }[];
  badges: { id: string; name: string; imageUrl: string | null }[];
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, loading, error } = useApi<Profile>(`/api/profile/${username}`);
  const [activityPage] = useState(1);
  const { data: activity } = useApi<{ items: { id: string; type: string; description: string; createdAt: string }[] }>(
    `/api/profile/${username}/activity?page=${activityPage}`
  );

  if (loading) return <><Navbar /><PageLoader /><Footer /></>;
  if (error || !profile) return (
    <><Navbar /><div className="mx-auto max-w-4xl px-4 py-20 text-center"><h1 className="text-2xl font-bold text-zinc-100">Profile not found</h1><p className="mt-2 text-zinc-500">{error || 'This user does not exist.'}</p></div><Footer /></>
  );

  const xpForNext = Math.pow((profile.level + 1) / 0.1, 2);
  const xpProgress = Math.min((profile.totalXp / xpForNext) * 100, 100);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-r from-red-900/40 to-zinc-900" style={profile.coverPhotoUrl ? { backgroundImage: `url(${profile.coverPhotoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />

        <div className="mx-auto max-w-4xl px-4">
          {/* Profile Header */}
          <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <Avatar src={profile.avatarUrl} alt={profile.displayName} size="xl" className="ring-4 ring-zinc-950" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-zinc-100">{profile.displayName}</h1>
              <p className="text-sm text-zinc-500">@{profile.username}</p>
              {profile.title && <p className="text-sm text-zinc-400">{profile.title}</p>}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Badge variant="info">Level {profile.level}</Badge>
                <span className="text-sm text-zinc-500">{profile.totalXp} XP</span>
              </div>
              <div className="mt-1 h-1.5 w-32 rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-red-500" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && <p className="mt-4 text-sm text-zinc-400">{profile.bio}</p>}
          {(profile.country || profile.city) && (
            <p className="mt-1 text-xs text-zinc-600">{[profile.city, profile.country].filter(Boolean).join(', ')}</p>
          )}

          {/* Skills & Interests */}
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((s) => <Badge key={s.name} variant="default">{s.name}</Badge>)}
            {profile.interests.map((i) => <Badge key={i.name} variant="info">{i.name}</Badge>)}
          </div>

          {/* Tabs */}
          <Tabs
            className="mt-8 pb-12"
            tabs={[
              {
                key: 'overview',
                label: 'Overview',
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                      <h3 className="mb-2 text-sm font-medium text-zinc-400">Roles</h3>
                      {profile.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">{profile.roles.map((r) => <Badge key={r.name}>{r.name}</Badge>)}</div>
                      ) : <p className="text-xs text-zinc-600">No roles</p>}
                    </Card>
                    <Card>
                      <h3 className="mb-2 text-sm font-medium text-zinc-400">Socials</h3>
                      {profile.socialLinks.length > 0 ? (
                        <div className="space-y-1">{profile.socialLinks.map((s) => (
                          <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-red-400 hover:text-red-300">{s.platform}</a>
                        ))}</div>
                      ) : <p className="text-xs text-zinc-600">No social links</p>}
                    </Card>
                  </div>
                ),
              },
              {
                key: 'activity',
                label: 'Activity',
                content: activity?.items?.length ? (
                  <div className="space-y-3">
                    {activity.items.map((a) => (
                      <div key={a.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                        <p className="text-sm text-zinc-300">{a.description}</p>
                        <p className="mt-1 text-xs text-zinc-600">{new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : <EmptyState title="No activity yet" />,
              },
              {
                key: 'achievements',
                label: 'Achievements',
                content: profile.badges.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {profile.badges.map((b) => (
                      <Card key={b.id} className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-900/30 text-yellow-400 text-xl">★</div>
                        <p className="text-sm font-medium text-zinc-200">{b.name}</p>
                      </Card>
                    ))}
                  </div>
                ) : <EmptyState title="No achievements yet" />,
              },
            ]}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
