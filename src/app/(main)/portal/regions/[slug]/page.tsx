'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';

interface RegionLead {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  title: string | null;
  role: string;
}

interface RegionMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  title: string | null;
  level: number;
  role: string;
  joinedAt: string;
}

interface RegionEvent {
  id: string;
  title: string;
  slug: string;
  type: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  isVirtual: boolean;
  rsvpCount: number;
}

interface RegionDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  country: string | null;
  city: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  memberCount: number;
  leads: RegionLead[];
  members: RegionMember[];
  events: RegionEvent[];
}

export default function RegionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data: region, loading } = useApi<RegionDetail>(`/api/portal/regions/${slug}`);

  if (loading) return <PageLoader />;
  if (!region) return <div className="py-20 text-center text-zinc-500">Region not found</div>;

  const isLead = region.leads.some((lead) => lead.id === user?.id);

  const locationParts = [region.city, region.country].filter(Boolean);
  const locationString = locationParts.length > 0 ? locationParts.join(', ') : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Cover Image */}
      {region.coverImageUrl && (
        <div className="relative mb-8 h-56 w-full overflow-hidden rounded-xl sm:h-72">
          <img
            src={region.coverImageUrl}
            alt={region.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
        </div>
      )}

      {/* Region Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        {region.logoUrl && (
          <img
            src={region.logoUrl}
            alt={`${region.name} logo`}
            className="h-20 w-20 rounded-xl border border-zinc-800 object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-zinc-100">{region.name}</h1>
          {locationString && (
            <p className="mt-1 text-sm text-zinc-400">
              <span className="mr-1.5 inline-block">📍</span>
              {locationString}
            </p>
          )}
          <p className="mt-1 text-sm text-zinc-500">
            {region.memberCount} {region.memberCount === 1 ? 'member' : 'members'}
          </p>
          {region.description && (
            <p className="mt-3 text-zinc-400 whitespace-pre-line">{region.description}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <Link href="/portal/membership">
          <Button variant="primary" size="md">
            Join Region
          </Button>
        </Link>
        {isLead && (
          <Link href={`/portal/regions/${region.slug}/manage`}>
            <Button variant="outline" size="md">
              Manage Region
            </Button>
          </Link>
        )}
      </div>

      {/* Leads Section */}
      {region.leads.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-zinc-100">Region Leads</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {region.leads.map((lead) => (
              <Card key={lead.id} className="flex items-center gap-4">
                <Avatar src={lead.avatarUrl} alt={lead.displayName} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-100">{lead.displayName}</p>
                  {lead.username && (
                    <p className="truncate text-sm text-zinc-500">@{lead.username}</p>
                  )}
                  {lead.title && (
                    <p className="mt-0.5 truncate text-sm text-zinc-400">{lead.title}</p>
                  )}
                  <Badge variant="danger" className="mt-1.5">{lead.role}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Events Section */}
      {region.events.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-zinc-100">Recent Events</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {region.events.map((event) => (
              <Link key={event.id} href={`/portal/events/${event.id}`}>
                <Card className="transition-colors hover:border-zinc-700 cursor-pointer">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="default">{event.type}</Badge>
                    {event.isVirtual && <Badge variant="info">Virtual</Badge>}
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <p className="mt-2 text-sm text-zinc-400">
                    {new Date(event.startDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {event.location && !event.isVirtual && (
                    <p className="mt-1 text-sm text-zinc-500">{event.location}</p>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">
                    {event.rsvpCount} {event.rsvpCount === 1 ? 'RSVP' : 'RSVPs'}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Members Grid */}
      {region.members.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-zinc-100">Members</h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {region.members.map((member) => (
              <Card key={member.id} className="flex flex-col items-center text-center p-4">
                <Avatar src={member.avatarUrl} alt={member.displayName} size="lg" />
                <p className="mt-3 truncate w-full font-medium text-zinc-100">
                  {member.displayName}
                </p>
                {member.username && (
                  <p className="truncate w-full text-xs text-zinc-500">@{member.username}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                  <Badge variant="default">Lv. {member.level}</Badge>
                  <Badge variant="info">{member.role}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
