'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  virtualUrl: string | null;
  isVirtual: boolean;
  maxAttendees: number | null;
  rsvpCount: number;
  status: string;
  coverImageUrl: string | null;
  hasRsvped: boolean;
  attendees: { id: string; displayName: string; avatarUrl: string | null }[];
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: event, loading, refetch } = useApi<EventDetail>(`/api/portal/events/${id}`);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const handleRsvp = async () => {
    if (!user) { addToast('error', 'Please sign in to RSVP'); return; }
    setRsvpLoading(true);
    const res = await api.post(`/api/portal/events/${id}/rsvp`);
    if (res.success) { addToast('success', event?.hasRsvped ? 'RSVP cancelled' : 'RSVP confirmed!'); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setRsvpLoading(false);
  };

  if (loading) return <PageLoader />;
  if (!event) return <div className="py-20 text-center text-zinc-500">Event not found</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {event.coverImageUrl && <img src={event.coverImageUrl} alt={event.title} className="mb-6 h-64 w-full rounded-xl object-cover" />}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={event.status === 'upcoming' ? 'info' : event.status === 'live' ? 'success' : 'default'}>{event.status}</Badge>
        <Badge variant="default">{event.eventType}</Badge>
        {event.isVirtual && <Badge variant="info">Virtual</Badge>}
      </div>

      <h1 className="text-3xl font-bold text-zinc-100">{event.title}</h1>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-zinc-500">Date & Time</p>
          <p className="font-medium text-zinc-200">{new Date(event.startDate).toLocaleString()}</p>
          {event.endDate && <p className="text-sm text-zinc-400">to {new Date(event.endDate).toLocaleString()}</p>}
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Location</p>
          <p className="font-medium text-zinc-200">{event.isVirtual ? 'Virtual Event' : event.location || 'TBD'}</p>
          {event.virtualUrl && <a href={event.virtualUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-red-400 hover:text-red-300">Join Link</a>}
        </Card>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button onClick={handleRsvp} loading={rsvpLoading} variant={event.hasRsvped ? 'outline' : 'primary'}>
          {event.hasRsvped ? 'Cancel RSVP' : 'RSVP'}
        </Button>
        <span className="text-sm text-zinc-500">{event.rsvpCount}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attending</span>
      </div>

      {event.description && (
        <div className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-zinc-100">About this event</h2>
          <div className="text-zinc-400 whitespace-pre-line">{event.description}</div>
        </div>
      )}

      {event.attendees?.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-zinc-100">Attendees</h2>
          <div className="flex flex-wrap gap-2">
            {event.attendees.map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 border border-zinc-800">
                <Avatar src={a.avatarUrl} alt={a.displayName} size="sm" />
                <span className="text-sm text-zinc-300">{a.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
