'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

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
  regionId: string | null;
  status: string;
  coverImageUrl: string | null;
}

function EventsContent() {
  const searchParams = useSearchParams();
  const regionSlug = searchParams.get('region') || '';
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('');
  const { data: events, loading, pagination } = useApi<Event[]>(
    `/api/portal/events?page=${page}&region=${regionSlug}&type=${eventType}&search=${search}`
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Events</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="max-w-xs" />
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
          <option value="">All Types</option>
          <option value="meetup">Meetup</option>
          <option value="hackathon">Hackathon</option>
          <option value="workshop">Workshop</option>
          <option value="conference">Conference</option>
          <option value="webinar">Webinar</option>
        </select>
      </div>

      {loading ? <PageLoader /> : !events?.length ? (
        <EmptyState title="No events found" description="Check back later for upcoming events" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/portal/events/${event.id}`}>
              <Card className="hover:border-zinc-700 transition-colors cursor-pointer h-full">
                {event.coverImageUrl && <img src={event.coverImageUrl} alt={event.title} className="mb-3 h-40 w-full rounded-lg object-cover" />}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={event.status === 'upcoming' ? 'info' : event.status === 'live' ? 'success' : 'default'}>
                    {event.status}
                  </Badge>
                  <Badge variant="default">{event.eventType}</Badge>
                  {event.isVirtual && <Badge variant="info">Virtual</Badge>}
                </div>
                <h3 className="font-semibold text-zinc-200">{event.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{new Date(event.startDate).toLocaleDateString()}</p>
                {event.location && <p className="text-xs text-zinc-600">{event.location}</p>}
                <p className="mt-2 text-xs text-zinc-500">{event.rsvpCount} attending</p>
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
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <EventsContent />
    </Suspense>
  );
}
