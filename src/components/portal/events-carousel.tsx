'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { useRegionFilter } from './region-filter-context';
import { BentoCard } from './bento-card';
import { HorizontalCarousel } from './horizontal-carousel';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  isVirtual: boolean;
  rsvpCount: number;
  status: string;
  coverImageUrl: string | null;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    live: 'bg-emerald-500/80',
    upcoming: 'bg-sky-500/60',
    past: 'bg-zinc-400/50',
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[status] || colors.past}`} />;
}

export function EventsCarousel() {
  const { selectedRegion } = useRegionFilter();
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('');

  const { data: events, loading } = useApi<Event[]>(
    `/api/portal/events?region=${selectedRegion}&type=${eventType}&search=${search}`
  );

  const filters = (
    <div className="flex items-center gap-2">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="h-8 w-32 rounded-full border-zinc-200 bg-transparent px-3 text-xs dark:border-zinc-800"
      />
      <select
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
        className="h-8 rounded-full border border-zinc-200 bg-transparent px-3 text-xs text-zinc-600 outline-none dark:border-zinc-800 dark:text-zinc-400"
      >
        <option value="">All</option>
        <option value="meetup">Meetup</option>
        <option value="hackathon">Hackathon</option>
        <option value="workshop">Workshop</option>
        <option value="conference">Conference</option>
        <option value="webinar">Webinar</option>
      </select>
    </div>
  );

  return (
    <BentoCard title="Events" headerRight={filters}>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="sm" />
        </div>
      ) : !events?.length ? (
        <p className="py-6 text-center text-xs text-zinc-400">No events found</p>
      ) : (
        <HorizontalCarousel>
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/portal/events/${event.id}`}
              className="group block w-60 shrink-0"
            >
              <div className="overflow-hidden rounded-xl border border-zinc-200/60 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700">
                {event.coverImageUrl ? (
                  <img
                    src={event.coverImageUrl}
                    alt={event.title}
                    className="h-28 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                    <svg className="h-8 w-8 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  </div>
                )}
                <div className="p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <StatusDot status={event.status} />
                    <span>{event.status}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span>{event.eventType}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1 dark:text-zinc-100">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </HorizontalCarousel>
      )}
    </BentoCard>
  );
}
