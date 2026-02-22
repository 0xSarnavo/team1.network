'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = [
  { name: 'DeFi', count: 45, color: 'text-green-400', bgColor: 'bg-green-900/20' },
  { name: 'NFTs & Gaming', count: 32, color: 'text-purple-400', bgColor: 'bg-purple-900/20' },
  { name: 'Infrastructure', count: 28, color: 'text-blue-400', bgColor: 'bg-blue-900/20' },
  { name: 'DAOs', count: 15, color: 'text-yellow-400', bgColor: 'bg-yellow-900/20' },
  { name: 'Social', count: 12, color: 'text-pink-400', bgColor: 'bg-pink-900/20' },
  { name: 'Developer Tools', count: 22, color: 'text-cyan-400', bgColor: 'bg-cyan-900/20' },
];

const featuredProjects = [
  {
    name: 'Trader Joe',
    description: 'Leading DEX on Avalanche with concentrated liquidity and limit orders.',
    category: 'DeFi',
    status: 'Live',
  },
  {
    name: 'Benqi',
    description: 'Lending and liquid staking protocol bringing DeFi to Avalanche users.',
    category: 'DeFi',
    status: 'Live',
  },
  {
    name: 'GoGoPool',
    description: 'Permissionless liquid staking for Avalanche subnet validators.',
    category: 'Infrastructure',
    status: 'Live',
  },
  {
    name: 'Dexalot',
    description: 'On-chain central limit order book (CLOB) running on an Avalanche subnet.',
    category: 'DeFi',
    status: 'Live',
  },
  {
    name: 'Salvor',
    description: 'NFT lending and borrowing protocol for Avalanche-based collections.',
    category: 'NFTs & Gaming',
    status: 'Live',
  },
  {
    name: 'The Arena',
    description: 'Social platform for crypto communities built on Avalanche.',
    category: 'Social',
    status: 'Live',
  },
];

export default function EcosystemPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <Badge variant="info" className="mb-4">Ecosystem</Badge>
        <h1 className="text-4xl font-bold text-zinc-100 md:text-5xl">Discover the Ecosystem</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
          Explore projects, tools, and protocols building on Avalanche.
          From DeFi to gaming, discover what's possible.
        </p>
      </div>

      {/* Categories */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-zinc-100">Categories</h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`rounded-lg border border-zinc-800 ${cat.bgColor} p-4 text-center transition-colors hover:border-zinc-700 cursor-pointer`}
            >
              <p className={`font-semibold ${cat.color}`}>{cat.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{cat.count} projects</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Projects */}
      <div className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-zinc-100">Featured Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <Card key={project.name} className="hover:border-zinc-700 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 font-bold text-sm">
                  {project.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-zinc-200 truncate">{project.name}</h3>
                    <Badge variant="success">{project.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                  <Badge variant="default" className="mt-2">{project.category}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Submit Project CTA */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-900/30 mb-4">
          <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-zinc-100 mb-2">Full Directory Coming Soon</h3>
        <p className="text-zinc-500 mb-6 max-w-lg mx-auto">
          The searchable ecosystem directory with project submissions, reviews, and integrations is being built.
          Explore the portal in the meantime.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/portal">
            <Button variant="primary">Explore Portal</Button>
          </Link>
          <Link href="/grants">
            <Button variant="outline">View Grants</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
