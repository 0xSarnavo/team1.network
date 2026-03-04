'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
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
  if (!region) return <div className="py-20 text-center text-sm text-zinc-400">Region not found</div>;

  const isLead = region.leads.some((lead) => lead.id === user?.id);
  const locationParts = [region.city, region.country].filter(Boolean);
  const locationString = locationParts.length > 0 ? locationParts.join(', ') : null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-24">
      {/* Back */}
      <Link href="/portal" className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        Portal
      </Link>

      {/* Region Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl">{region.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {locationString && <span>{locationString}</span>}
            <span>{region.memberCount} members</span>
          </div>
          {region.description && (
            <p className="mt-3 text-sm text-zinc-500 max-w-xl">{region.description}</p>
          )}
        </div>
        {isLead && (
          <Link
            href={`/portal/regions/${slug}/manage`}
            className="shrink-0 inline-flex items-center rounded-full border border-zinc-300 bg-white px-5 py-2 text-xs font-bold text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-zinc-900 active:scale-95"
          >
            Manage
          </Link>
        )}
      </div>

      {/* Leads */}
      {region.leads.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Leadership</h2>
          <div className="flex flex-wrap gap-3">
            {region.leads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-2.5 rounded-2xl border border-zinc-200/60 px-4 py-2.5 dark:border-zinc-800/60">
                <Avatar src={lead.avatarUrl} alt={lead.displayName} size="sm" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{lead.displayName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{lead.role === 'co_lead' ? 'Co-Lead' : lead.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events */}
      {region.events.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Upcoming Events</h2>
          <div className="space-y-2">
            {region.events.map((event) => (
              <Link key={event.id} href={`/portal/events/${event.id}`}>
                <div className="flex items-center justify-between rounded-2xl border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{event.title}</h3>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <span>{event.type}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      {event.location && (
                        <>
                          <span className="text-zinc-300 dark:text-zinc-700">·</span>
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">{event.rsvpCount} RSVPs</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      {region.members.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Members</h2>
          <div className="space-y-1.5">
            {region.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-2xl border border-zinc-200/60 px-4 py-3 dark:border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <Avatar src={member.avatarUrl} alt={member.displayName} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{member.displayName}</p>
                    <p className="text-[10px] text-zinc-400">Level {member.level}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
