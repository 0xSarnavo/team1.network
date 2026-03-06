'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    `/api/portal/events?region=${selectedRegion}&type=${eventType === 'all' ? '' : eventType}&search=${search}`
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const eventTypes = [
    { value: 'all', label: 'All' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'conference', label: 'Conference' },
    { value: 'webinar', label: 'Webinar' },
  ];

  const filters = (
    <div className="flex items-center gap-2">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="h-8 w-32 rounded-lg border-zinc-200 bg-white px-3 text-xs dark:border-zinc-800/80 dark:bg-zinc-950"
      />
      
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-600 outline-none transition-colors hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          {eventTypes.find((t) => t.value === (eventType || 'all'))?.label}
          <svg className={`h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 w-32 overflow-hidden rounded-xl border border-zinc-200/50 bg-white shadow-xl dark:border-zinc-800/80 dark:bg-[#111111]">
            <div className="p-1">
              {eventTypes.map((type) => {
                const isSelected = (eventType || 'all') === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      setEventType(type.value === 'all' ? '' : type.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      isSelected 
                        ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100' 
                        : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50'
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-3 w-3 shrink-0 text-zinc-900 dark:text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={isSelected ? '' : 'pl-5'}>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <BentoCard title="Events" headerRight={filters}>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="sm" />
        </div>
      ) : !events?.length ? (
        <div className="flex w-full flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 h-[1px] w-6 bg-zinc-800" />
          <svg className="mb-3 h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mb-2 text-sm font-bold text-zinc-900 dark:text-white">No events found</h3>
          <p className="text-xs text-zinc-500 max-w-[200px]">Check back soon for upcoming events.</p>
        </div>
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
                  <div className="flex h-28 items-center justify-center bg-zinc-100 dark:bg-[#18181b]">
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
