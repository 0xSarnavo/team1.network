'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { useGrantTab, type GrantTab } from '@/components/grants/grant-tab-context';
import { mainGrant, grantFaq, discoverProjects, type FaqCategory, type DiscoverProject } from '../grant-data';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MiniGrantsPage() {
  const { user } = useAuth();
  const tabCtx = useGrantTab();
  const activeTab = tabCtx?.activeTab ?? 'discover';

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      {activeTab === 'discover' && <DiscoverTab />}
      {activeTab === 'details' && <DetailsTab user={user} />}
      {activeTab === 'faq' && <FaqTab categories={grantFaq} />}
      {activeTab === 'submissions' && user && <SubmissionsTab user={user} />}
    </div>
  );
}

// ==========================================================================
// DETAILS TAB — grant info, eligibility, deliverables
// ==========================================================================

function DetailsTab({ user }: { user: unknown }) {
  return (
    <div className="space-y-20">
      {/* ————— HERO ————— */}
      <section className="text-center pt-4">
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <svg className="h-5 w-5 text-[#FF394A]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 19h20L12 2zm0 4l7 13H5l7-13z"/></svg>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">ava1anche</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl uppercase">
          TEAM1 <span className="text-zinc-900 dark:text-zinc-100">MINI GRANTS</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-zinc-500 dark:text-zinc-400">
          Fueling innovation in the Avalanche ecosystem by streamlining grants for builders, creators and communities.
        </p>
        <div className="mt-6">
          {user ? (
            <button className="inline-flex items-center rounded-full bg-[#FF394A] px-8 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95">
              Apply for Grant
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center rounded-full bg-[#FF394A] px-8 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            >
              Apply for Grant
            </Link>
          )}
        </div>
      </section>

      {/* ————— ABOUT ————— */}
      <section className="grid gap-8 md:grid-cols-2 items-center">
        <div className="flex items-center justify-center">
          <div className="relative h-48 w-48 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-900">
            <svg className="h-24 w-24 text-[#FF394A]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl">
            TEAM1 <span className="text-[#FF394A]">GRANTS</span>
          </h2>
          <div className="mt-4 space-y-3 border-l-2 border-zinc-300 pl-4 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Team1 Grants support early-stage projects building on Avalanche by providing funding, mentorship, and hands-on guidance. Our goal is to help founders go from idea to MVP, and reach their first users with confidence.
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              These grants are managed independently by Team1 and are separate from Avalanche Foundation grants. We offer both monetary support and technical/business expertise to bring bold ideas to life within the Avalanche ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* ————— PROJECT PHASES — vertical timeline ————— */}
      <section>
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl uppercase mb-10">
          Project Phases
        </h2>

        <div className="relative">
          {[
            {
              phase: '01',
              title: 'Application & Evaluation',
              bullets: [
                'Submit your whitepaper/litepaper, prototype, market analysis, and other relevant details.',
                'Showcase your team, the idea, and early-stage thinking.',
                'After internal evaluation, selected projects will be contacted for interviews.',
                'Finalists from interviews will move on to the next phase.',
              ],
            },
            {
              phase: '02',
              title: 'Milestone Setup & Initial Grants',
              bullets: [
                'Selected projects receive initial funding and development credits to begin building.',
                'Project-specific milestones are defined collaboratively.',
                'Additional funding is released as each milestone is completed.',
                'The primary goal is to reach the MVP (Minimum Viable Product) stage.',
              ],
            },
            {
              phase: '03',
              title: 'MVP Launch & User Feedback',
              bullets: [
                'Once the MVP is launched, teams receive funding for marketing and user acquisition.',
                'Team1 and its network will support projects in reaching their first set of users.',
                'Teams are expected to gather and incorporate user feedback to improve the product.',
              ],
            },
            {
              phase: '04',
              title: 'Demo Day & Codebase Interview',
              bullets: [
                'After releasing the product on testnet or mainnet, teams qualify for Demo Day.',
                'Demo Days are held twice a year and attended by investors, the Avalabs BD team, and ecosystem partners.',
                'Projects present their product to raise funds and build strategic connections.',
                'Selected teams will also have the opportunity to interview for Codebase, Avalanche\'s official accelerator program.',
              ],
            },
          ].map((item, idx, arr) => (
            <div key={item.phase} className="relative grid grid-cols-[120px_24px_1fr] md:grid-cols-[180px_24px_1fr] gap-x-4 pb-12 last:pb-0">
              {/* Phase label */}
              <div className="text-right pt-0.5">
                <span className="text-lg font-black text-zinc-300 dark:text-zinc-600 tracking-wider">PHASE {item.phase}</span>
              </div>

              {/* Timeline dot + line */}
              <div className="flex flex-col items-center">
                <div className="relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#FF394A] bg-white dark:bg-zinc-900">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#FF394A]" />
                </div>
                {idx < arr.length - 1 && (
                  <div className="w-px flex-1 bg-zinc-300 dark:bg-zinc-700 mt-1" />
                )}
              </div>

              {/* Content */}
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">{item.title}</h3>
                <ul className="space-y-1">
                  {item.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ————— WHO SHOULD APPLY ————— */}
      <section>
        <h2 className="text-center text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl mb-10">
          Who Should <span className="text-[#FF394A]">Apply</span>
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', title: "You've Built Something in Web3", desc: "Whether it's a dApp, smart contract, or prototype -- you're not just ideating, you're building." },
            { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'You Take Risks and Iterate Fast', desc: "You're ready to test, fail, and improve -- because that's how real products are born." },
            { icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z', title: "You're Open to Feedback", desc: 'You want mentorship, insights, and critiques to help shape your next version.' },
            { icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z', title: 'You Have a Whitepaper and Prototype', desc: "You've thought it through -- and you're serious enough to document your vision." },
            { icon: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z', title: 'You Know Your Users', desc: 'You have an early sense of product-market fit and how revenue might work.' },
            { icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', title: "You're Ready to Scale", desc: 'You understand the fundamentals and are prepared to grow your team and community.' },
          ].map((item, i) => (
            <div key={i} className="group">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF394A]/10">
                <svg className="h-5 w-5 text-[#FF394A]" fill="currentColor" viewBox="0 0 24 24"><path d={item.icon} /></svg>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">{item.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ————— WHAT WE'RE LOOKING FOR ————— */}
      <section>
        <h2 className="text-center text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl mb-10">
          What We&apos;re Looking <span className="text-[#FF394A]">For</span>
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: 'M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9z', title: 'Wallets', desc: 'Secure storage solutions for digital assets' },
            { icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z', title: 'Oracles', desc: 'Connecting blockchain to real-world data' },
            { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', title: 'Interoperability Tools', desc: 'Tools for cross-chain communication' },
            { icon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z', title: 'Cryptography', desc: 'Advanced security and privacy solutions' },
            { icon: 'M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z', title: 'Bridges', desc: 'Connect between different blockchains' },
            { icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z', title: 'Explorers', desc: 'Visualize and navigate blockchain data' },
            { icon: 'M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm0-10H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z', title: 'RPC', desc: 'Backend infrastructure for Web3' },
            { icon: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z', title: 'Data Storage', desc: 'Decentralized storage solutions' },
            { icon: 'M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h18v8zM6 15h2v-2h2v-2H8V9H6v2H4v2h2z', title: 'Culture/NFT', desc: 'Digital collectibles and cultural assets' },
            { icon: 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z', title: 'Enterprise', desc: 'Blockchain for business applications' },
            { icon: 'M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8z', title: 'Exchange/Wallet Integrations', desc: 'Trading and exchange platforms' },
            { icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z', title: 'Payments', desc: 'Crypto payment solutions' },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF394A]/10">
                  <svg className="h-3.5 w-3.5 text-[#FF394A]" fill="currentColor" viewBox="0 0 24 24"><path d={item.icon} /></svg>
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.title}</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.desc}</p>
            </div>
          ))}
          {/* Got Something Else */}
          <div className="rounded-2xl border border-[#FF394A]/30 bg-[#FF394A]/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF394A]/20">
                <svg className="h-3.5 w-3.5 text-[#FF394A]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Got Something Else?</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">If your idea doesn&apos;t fit into the categories above, we still want to hear from you. Apply and let us know more!</p>
          </div>
        </div>
      </section>

      {/* ————— WHAT WE PROVIDE ————— */}
      <section>
        <h2 className="text-center text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl mb-10">
          What We <span className="text-[#FF394A]">Provide</span>
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm1-10c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z', title: 'Milestone Planning', desc: 'Co-develop a roadmap with experts.' },
            { icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z', title: 'Technical & Strategic Mentorship', desc: 'Get 1:1 support from experienced builders and domain experts.' },
            { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'MVP Development Guidance', desc: 'Build what matters -- validated by the team and user insights.' },
            { icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z', title: 'User Feedback Loop Planning', desc: 'Craft a feedback pipeline with real users for iteration and growth.' },
            { icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', title: 'Access to Community Testers', desc: 'Engage with early adopters for valuable testing and traction.' },
            { icon: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', title: 'Demo Day Eligibility', desc: 'Pitch your progress to the ecosystem at our final showcase.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF394A]/10">
                <svg className="h-4 w-4 text-[#FF394A]" fill="currentColor" viewBox="0 0 24 24"><path d={item.icon} /></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ————— ADDITIONAL INCENTIVES ————— */}
      <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Additional Incentives</h2>
          <p className="mt-1 text-xs text-zinc-500">Unlock even more opportunities for exceptional participants</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z', title: 'Funding Opportunities', desc: 'Stand a chance to unlock grants, BD support, or Blizzard resources.' },
            { icon: 'M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z', title: 'Spotlight Moments', desc: 'Be featured across community channels and partner platforms.' },
            { icon: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z', title: 'Investor Access', desc: 'Selected teams pitch at Demo Day for funding or strategic backing.' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-zinc-200/40 p-4 text-center dark:border-zinc-800/40">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#FF394A]/10">
                <svg className="h-4 w-4 text-[#FF394A]" fill="currentColor" viewBox="0 0 24 24"><path d={item.icon} /></svg>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ————— BIG RED CTA BANNER ————— */}
      <section className="rounded-2xl bg-gradient-to-br from-[#FF394A] to-[#e8243a] p-10 md:p-14 border border-[#FF394A]/30">
        <h2 className="text-2xl font-black text-white uppercase md:text-3xl leading-tight">
          HAVE A BIG IDEA?<br />
          <span className="ml-8 md:ml-16">WE WANT TO FUND IT.</span>
        </h2>
        <p className="mt-4 text-sm text-white/80 max-w-lg">
          Start your application in minutes and bring your project to life with team1 Grants.
        </p>
        <div className="mt-6">
          {user ? (
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-100 active:scale-95">
              Apply for Grant
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-100 active:scale-95"
            >
              Apply for Grant
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

// ==========================================================================
// DISCOVER TAB — project showcase grid
// ==========================================================================

function DiscoverTab() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const allTags = Array.from(new Set(discoverProjects.flatMap((p) => p.tags)));

  const filtered = discoverProjects.filter((p) => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.tags.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">
          Discover Builders
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-500 dark:text-zinc-400">
          Explore the innovative projects being built on Avalanche. Filter by category to find what you&apos;re looking for.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-600 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:focus:border-zinc-600 sm:w-48"
        >
          <option value="all">Filter by category</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-400">No projects match your search.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: DiscoverProject }) {
  const statusColor = project.status === 'Accepted'
    ? 'bg-emerald-500/90 text-white'
    : project.status === 'In Review'
      ? 'bg-amber-500/90 text-white'
      : 'bg-zinc-500/90 text-white';

  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-2xl">
        {project.image ? (
          <img src={project.image} alt={project.title} className="h-40 w-full object-cover" />
        ) : (
          <div className="flex h-40 items-center justify-center bg-zinc-100 dark:bg-zinc-900/80">
            <svg className="h-10 w-10 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute right-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-bold ${statusColor}`}>
          {project.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{project.title}</h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{project.description}</p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-[10px] font-bold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              {tag}
            </span>
          ))}
        </div>

        {/* View Details button */}
        <button className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-2 text-xs font-bold text-zinc-600 transition-all hover:border-[#FF394A] hover:bg-[#FF394A] hover:text-white dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-[#FF394A] dark:hover:bg-[#FF394A] dark:hover:text-white active:scale-[0.98]">
          View Details
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ==========================================================================
// FAQ TAB — categorized two-column accordion
// ==========================================================================

function FaqTab({ categories }: { categories: FaqCategory[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div>
      <h1 className="mb-10 text-center text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-4xl">
        Frequently Asked Questions
      </h1>

      <div className="space-y-12">
        {categories.map((cat) => (
          <div key={cat.category} className="grid gap-x-8 md:grid-cols-[220px_1fr]">
            {/* Category label */}
            <h2 className="mb-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 md:mb-0 md:pt-3">
              {cat.category}
            </h2>

            {/* Questions */}
            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
              {cat.items.map((item, i) => {
                const key = `${cat.category}-${i}`;
                const isOpen = openKey === key;

                return (
                  <button
                    key={key}
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    className="w-full py-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.q}</h3>
                      <span className="shrink-0 text-zinc-400">
                        {isOpen ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        )}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pr-8 whitespace-pre-line">{item.a}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================================================
// SUBMISSIONS TAB — user stats + projects
// ==========================================================================

interface AuthUser {
  id: string;
  displayName: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  createdAt?: string;
}

function SubmissionsTab({ user }: { user: AuthUser }) {
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">My Submissions</h1>
        <p className="mt-1 text-sm text-zinc-500">Track and manage your grant applications</p>
      </div>

      {/* User card */}
      <div className="mb-8 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatarUrl} alt={user.displayName} size="md" />
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.displayName}</p>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                {user.email && <span>{user.email}</span>}
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#FF394A]/30 bg-[#FF394A]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#FF394A]">0 Projects</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70">Active</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {[
            { value: '0', label: 'Submissions' },
            { value: '0', label: 'In Review', accent: true },
            { value: '0', label: 'Approved' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-xl font-black ${stat.accent ? 'text-[#FF394A]' : 'text-zinc-900 dark:text-zinc-100'}`}>{stat.value}</div>
              <div className="text-[10px] text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Projects */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Your Projects</h2>
        <span className="text-xs text-zinc-400">0 projects submitted</span>
      </div>

      {/* Empty state */}
      <div className="rounded-2xl border border-zinc-200 p-12 text-center dark:border-zinc-800">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#FF394A]/30">
          <svg className="h-7 w-7 text-[#FF394A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">No Submissions Yet</h3>
        <p className="text-xs text-zinc-500 mb-6 max-w-xs mx-auto">
          You haven&apos;t submitted any grant applications yet. Start your journey by creating your first project submission.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button className="inline-flex items-center gap-1.5 rounded-full bg-[#FF394A] px-5 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Submit Your First Project
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
          <button className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-xs font-bold text-zinc-900 transition-all hover:bg-[#FF394A] hover:text-white hover:border-[#FF394A] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-[#FF394A] dark:hover:text-white dark:hover:border-[#FF394A] active:scale-95">
            Learn About Grants
          </button>
        </div>
      </div>
    </div>
  );
}
