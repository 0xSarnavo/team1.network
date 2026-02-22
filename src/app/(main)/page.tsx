'use client';

import React from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';

interface HomeData {
  hero: { heading: string; subheading: string | null; backgroundUrl: string | null; ctas: { label: string; url: string }[] | null } | null;
  about: { content: string; imageUrl: string | null } | null;
  stats: { id: string; label: string; value: number | null; icon: string | null }[];
  announcements: { id: string; title: string; summary: string | null; linkUrl: string | null }[];
  regions: { id: string; name: string; slug: string; logoUrl: string | null; description: string | null; memberCount: number }[];
  partners: { id: string; name: string; logoUrl: string; websiteUrl: string | null }[];
  footer: { tagline: string | null } | null;
}

export default function HomePage() {
  const { data: home, loading } = useApi<HomeData>('/api/home');

  if (loading) return <PageLoader />;

  return (
    <div>
      {/* Hero */}
      {home?.hero && (
        <section
          className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
          style={home.hero.backgroundUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${home.hero.backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 to-zinc-950" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-zinc-100 md:text-6xl">{home.hero.heading}</h1>
            {home.hero.subheading && <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">{home.hero.subheading}</p>}
            {home.hero.ctas && home.hero.ctas.length > 0 && (
              <div className="mt-8 flex justify-center gap-4">
                {home.hero.ctas.map((cta, i) => (
                  <Link key={i} href={cta.url}>
                    <Button variant={i === 0 ? 'primary' : 'outline'} size="lg">{cta.label}</Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats */}
      {home?.stats && home.stats.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {home.stats.map((s) => (
              <StatCard key={s.id} label={s.label} value={s.value?.toLocaleString() ?? '—'} />
            ))}
          </div>
        </section>
      )}

      {/* About */}
      {home?.about && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-zinc-100">About</h2>
              <div className="text-zinc-400 leading-relaxed whitespace-pre-line">{home.about.content}</div>
            </div>
            {home.about.imageUrl && (
              <div className="rounded-xl overflow-hidden">
                <img src={home.about.imageUrl} alt="About" className="w-full h-auto object-cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Announcements */}
      {home?.announcements && home.announcements.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-8 text-3xl font-bold text-zinc-100">Announcements</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {home.announcements.map((a) => (
              <Card key={a.id}>
                <h3 className="font-semibold text-zinc-200">{a.title}</h3>
                {a.summary && <p className="mt-2 text-sm text-zinc-500">{a.summary}</p>}
                {a.linkUrl && (
                  <Link href={a.linkUrl} className="mt-3 inline-block text-sm text-red-400 hover:text-red-300">
                    Read more →
                  </Link>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Regions */}
      {home?.regions && home.regions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-8 text-3xl font-bold text-zinc-100">Regions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {home.regions.map((r) => (
              <Link key={r.id} href={`/portal?region=${r.slug}`}>
                <Card className="hover:border-red-900/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    {r.logoUrl ? (
                      <img src={r.logoUrl} alt={r.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900/30 text-red-400 font-bold">{r.name[0]}</div>
                    )}
                    <div>
                      <h3 className="font-semibold text-zinc-200">{r.name}</h3>
                      <p className="text-xs text-zinc-500">{r.memberCount} members</p>
                    </div>
                  </div>
                  {r.description && <p className="mt-2 text-sm text-zinc-500 line-clamp-2">{r.description}</p>}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Partners */}
      {home?.partners && home.partners.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-zinc-100">Partners</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {home.partners.map((p) => (
              <a key={p.id} href={p.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" className="group">
                <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 transition-colors group-hover:border-zinc-700">
                  <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="mt-1 text-center text-xs text-zinc-600">{p.name}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Modules */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-zinc-100">Explore</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Portal', desc: 'Events, quests, guides & membership', href: '/portal', color: 'text-blue-400' },
            { name: 'Grants', desc: 'Funding for your projects', href: '/grants', color: 'text-green-400' },
            { name: 'Bounty', desc: 'Complete tasks & earn rewards', href: '/bounty', color: 'text-yellow-400' },
            { name: 'Ecosystem', desc: 'Discover projects & tools', href: '/ecosystem', color: 'text-purple-400' },
          ].map((m) => (
            <Link key={m.name} href={m.href}>
              <Card className="hover:border-zinc-700 transition-colors cursor-pointer h-full">
                <h3 className={`text-lg font-bold ${m.color}`}>{m.name}</h3>
                <p className="mt-2 text-sm text-zinc-500">{m.desc}</p>
                <Badge variant="default" className="mt-3">Explore →</Badge>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
