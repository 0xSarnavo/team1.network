'use client';

import React from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { WorldMap } from '@/components/ui/world-map';

interface HomeData {
  hero: { heading: string; subheading: string | null; backgroundUrl: string | null; ctas: { label: string; url: string }[] | null } | null;
  about: { content: string; imageUrl: string | null } | null;
  stats: { id: string; label: string; value: number | null; icon: string | null }[];
  announcements: { id: string; title: string; summary: string | null; linkUrl: string | null }[];
  regions: { id: string; name: string; slug: string; country: string | null; city: string | null; logoUrl: string | null; description: string | null; memberCount: number }[];
  partners: { id: string; name: string; logoUrl: string; websiteUrl: string | null }[];
  footer: { tagline: string | null } | null;
}

const supportCards = [
  {
    title: 'Grants',
    description: 'Funding for innovative projects building on Avalanche. Apply for grants to bring your ideas to life.',
    href: '/grants',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Events',
    description: 'Meetups, hackathons, and workshops in your region. Connect with fellow builders IRL and online.',
    href: '/portal/events',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: 'Quests',
    description: 'Complete challenges, earn XP, and level up. Gamified onboarding into the Avalanche ecosystem.',
    href: '/portal/quests',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: 'Ecosystem',
    description: 'Discover projects, tools, and resources across the Avalanche network. Find your next collaboration.',
    href: '/ecosystem',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const { data: home, loading } = useApi<HomeData>('/api/home');

  if (loading) return <PageLoader />;

  return (
    <div>
      {/* ============ HERO ============ */}
      {home?.hero && (
        <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.12)_0%,_transparent_50%)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-red-500/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-red-600/5 blur-3xl" />

          <div className="relative z-10 max-w-4xl">
            <Badge variant="danger" className="mb-6">Powered by Avalanche</Badge>

            <h1 className="text-5xl font-bold leading-tight tracking-tight text-zinc-100 md:text-7xl">
              {home.hero.heading}
            </h1>

            {home.hero.subheading && (
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
                {home.hero.subheading}
              </p>
            )}

            {home.hero.ctas && home.hero.ctas.length > 0 && (
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {home.hero.ctas.map((cta, i) => (
                  <Link key={i} href={cta.url}>
                    <Button variant={i === 0 ? 'primary' : 'outline'} size="lg">{cta.label}</Button>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-zinc-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>
      )}

      {/* ============ WHO WE ARE ============ */}
      {home?.about && (
        <section className="mx-auto max-w-7xl px-4 py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-500">Who We Are</p>
              <h2 className="mb-6 text-4xl font-bold text-zinc-100">Building the Avalanche Ecosystem, Together</h2>
              <div className="space-y-4 text-lg leading-relaxed text-zinc-400 whitespace-pre-line">
                {home.about.content}
              </div>
              <div className="mt-8">
                <Link href="/portal">
                  <Button variant="outline" size="md">Explore the Portal &rarr;</Button>
                </Link>
              </div>
            </div>

            {home.about.imageUrl ? (
              <div className="relative">
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-red-500/10 to-transparent blur-xl" />
                <div className="relative overflow-hidden rounded-xl border border-zinc-800">
                  <img src={home.about.imageUrl} alt="About team1" className="h-auto w-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 p-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30">
                    <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 20h20L12 2zm0 4l7 14H5l7-14z" />
                    </svg>
                  </div>
                  <p className="text-zinc-500">Empowering builders across the globe</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============ GLOBAL PRESENCE (MAP) ============ */}
      {home?.regions && home.regions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24">
          <div className="text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-500">Global Presence</p>
            <h2 className="mb-4 text-4xl font-bold text-zinc-100">
              Active Across {home.regions.length} Regions
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-zinc-400">
              Our community spans continents. Click on any region to explore local events, members, and initiatives.
            </p>
          </div>

          {/* Map */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 md:p-8">
            <WorldMap regions={home.regions} />
          </div>

          {/* Mobile fallback list */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:hidden">
            {home.regions.map((r) => (
              <Link key={r.id} href={`/portal/regions/${r.slug}`}>
                <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-red-900/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-900/30 text-sm font-bold text-red-400">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{r.name}</p>
                    <p className="text-xs text-zinc-500">{r.memberCount} members</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ IMPACT NUMBERS ============ */}
      {home?.stats && home.stats.length > 0 && (
        <section className="border-y border-zinc-800 bg-zinc-900/20 py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-500">Our Impact</p>
              <h2 className="text-4xl font-bold text-zinc-100">Growing Every Day</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {home.stats.map((s) => (
                <div key={s.id} className="text-center">
                  <p className="text-4xl font-bold text-zinc-100 md:text-5xl">
                    {s.value?.toLocaleString() ?? '0'}
                  </p>
                  <p className="mt-2 text-sm font-medium text-zinc-400 md:text-base">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ HOW WE SUPPORT BUILDERS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-500">What We Offer</p>
          <h2 className="text-4xl font-bold text-zinc-100">How We Support Builders</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            From grants to community events, we provide the tools and support Web3 builders need to succeed on Avalanche.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {supportCards.map((item) => (
            <Link key={item.title} href={item.href}>
              <Card className="group h-full transition-all duration-200 hover:border-red-900/50 hover:-translate-y-1 cursor-pointer">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-900/20 text-red-400 transition-colors group-hover:bg-red-900/30">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ ANNOUNCEMENTS ============ */}
      {home?.announcements && home.announcements.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-500">Latest News</p>
            <h2 className="text-4xl font-bold text-zinc-100">Announcements</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {home.announcements.map((a) => (
              <Card key={a.id} className="group transition-colors hover:border-zinc-700">
                <h3 className="font-semibold text-zinc-200 group-hover:text-zinc-100">{a.title}</h3>
                {a.summary && <p className="mt-2 text-sm text-zinc-500">{a.summary}</p>}
                {a.linkUrl && (
                  <Link href={a.linkUrl} className="mt-4 inline-flex items-center text-sm text-red-400 hover:text-red-300">
                    Read more
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ============ PARTNERS ============ */}
      {home?.partners && home.partners.length > 0 && (
        <section className="border-t border-zinc-800 py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-500">Backed By</p>
              <h2 className="text-4xl font-bold text-zinc-100">Our Partners</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {home.partners.map((p) => (
                <a key={p.id} href={p.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" className="group">
                  <div className="flex h-20 w-36 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-all group-hover:border-zinc-700 group-hover:bg-zinc-900/60">
                    <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain opacity-60 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-2 text-center text-xs text-zinc-600">{p.name}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-12 text-center md:p-20">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-red-600/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-zinc-100 md:text-5xl">Ready to Build the Future?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
              Join thousands of builders, creators, and innovators in the Avalanche ecosystem. Your journey starts here.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button variant="primary" size="lg">Join the Community</Button>
              </Link>
              <Link href="/portal">
                <Button variant="outline" size="lg">Explore Portal</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
