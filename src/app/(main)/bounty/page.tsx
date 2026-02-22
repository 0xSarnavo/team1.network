'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const bountyCategories = [
  {
    title: 'Development',
    description: 'Build features, fix bugs, or create tools for the Avalanche ecosystem.',
    icon: '{ }',
    rewards: '$100 - $5,000',
    color: 'text-blue-400',
  },
  {
    title: 'Security',
    description: 'Find vulnerabilities, perform audits, and improve protocol security.',
    icon: '🛡',
    rewards: '$500 - $50,000',
    color: 'text-red-400',
  },
  {
    title: 'Content',
    description: 'Write tutorials, create videos, or design educational materials.',
    icon: '✍',
    rewards: '$50 - $1,000',
    color: 'text-green-400',
  },
  {
    title: 'Translation',
    description: 'Translate documentation and content to support global adoption.',
    icon: '🌐',
    rewards: '$50 - $500',
    color: 'text-purple-400',
  },
  {
    title: 'Design',
    description: 'Create UI/UX designs, branding assets, and visual content.',
    icon: '🎨',
    rewards: '$100 - $2,000',
    color: 'text-yellow-400',
  },
  {
    title: 'Community',
    description: 'Organize events, moderate communities, and grow regional presence.',
    icon: '👥',
    rewards: '$50 - $1,000',
    color: 'text-cyan-400',
  },
];

export default function BountyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <Badge variant="warning" className="mb-4">Bounty Board</Badge>
        <h1 className="text-4xl font-bold text-zinc-100 md:text-5xl">Earn While You Build</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
          Complete bounties to earn rewards and XP. From development to design,
          there are opportunities for every skill set.
        </p>
      </div>

      {/* Categories */}
      <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bountyCategories.map((cat) => (
          <Card key={cat.title} className="hover:border-zinc-700 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold ${cat.color}`}>{cat.title}</h3>
                  <Badge variant="default">{cat.rewards}</Badge>
                </div>
                <p className="mt-2 text-sm text-zinc-500">{cat.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-zinc-100">How Bounties Work</h2>
        <div className="grid gap-8 md:grid-cols-4">
          {[
            { step: '1', title: 'Browse', desc: 'Find a bounty that matches your skills and interests.' },
            { step: '2', title: 'Claim', desc: 'Reserve the bounty and start working on the deliverables.' },
            { step: '3', title: 'Submit', desc: 'Submit your work with proof of completion for review.' },
            { step: '4', title: 'Earn', desc: 'Get paid in AVAX or USDC and earn community XP.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-yellow-900/30 text-yellow-400 font-bold mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-zinc-200">{item.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon CTA */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-900/30 mb-4">
          <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-zinc-100 mb-2">Bounty Board Launching Soon</h3>
        <p className="text-zinc-500 mb-6 max-w-lg mx-auto">
          We're preparing the bounty board. Complete quests in the portal to build your reputation and be first in line.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/portal/quests">
            <Button variant="primary">Explore Quests</Button>
          </Link>
          <Link href="/portal">
            <Button variant="outline">Visit Portal</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
