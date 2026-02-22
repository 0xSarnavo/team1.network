'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const grantTracks = [
  {
    title: 'Builder Grants',
    description: 'Funding for developers building on Avalanche. Get support for your dApp, protocol, or tooling project.',
    amount: 'Up to $50,000',
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
  },
  {
    title: 'Community Grants',
    description: 'Support for community initiatives, education programs, and regional growth efforts.',
    amount: 'Up to $10,000',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
  },
  {
    title: 'Research Grants',
    description: 'Funding for academic research, security audits, and technical analysis of Avalanche technology.',
    amount: 'Up to $25,000',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
  },
  {
    title: 'Creator Grants',
    description: 'Support for content creators, designers, and artists contributing to the ecosystem.',
    amount: 'Up to $5,000',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
  },
];

export default function GrantsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <Badge variant="success" className="mb-4">Grants Program</Badge>
        <h1 className="text-4xl font-bold text-zinc-100 md:text-5xl">Fund Your Vision</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
          Get funding to build on Avalanche. Our grants program supports builders, researchers,
          community leaders, and creators at every stage.
        </p>
      </div>

      {/* Grant Tracks */}
      <div className="mb-16 grid gap-6 md:grid-cols-2">
        {grantTracks.map((track) => (
          <Card key={track.title} className="relative overflow-hidden">
            <div className={`absolute inset-0 ${track.bgColor} opacity-30`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xl font-bold ${track.color}`}>{track.title}</h3>
                <Badge variant="default">{track.amount}</Badge>
              </div>
              <p className="text-sm text-zinc-400">{track.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-zinc-100">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { step: '1', title: 'Apply', desc: 'Submit your proposal with project details, milestones, and funding requirements.' },
            { step: '2', title: 'Review', desc: 'Our team reviews applications and may schedule a call to discuss your project.' },
            { step: '3', title: 'Build', desc: 'Receive funding in milestone-based tranches as you hit your development targets.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-900/30 text-green-400 text-lg font-bold mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon CTA */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-900/30 mb-4">
          <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-zinc-100 mb-2">Applications Opening Soon</h3>
        <p className="text-zinc-500 mb-6 max-w-lg mx-auto">
          The grants program is being finalized. Join the community to be notified when applications open.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/portal">
            <Button variant="primary">Explore Portal</Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline">Join Community</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
