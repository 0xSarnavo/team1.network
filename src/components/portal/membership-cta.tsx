'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { MembershipApplyModal } from '@/components/portal/membership-apply-modal';

interface MembershipInfo {
  isMember: boolean;
  regionName?: string;
}

export function MembershipCTA() {
  const { user } = useAuth();
  const { data } = useApi<MembershipInfo>(
    user ? '/api/portal/membership/info' : '',
    { immediate: !!user },
  );

  const isMember = user && data?.isMember;
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-[20px] border border-zinc-200 bg-white dark:border-white/5 dark:bg-black">
        {/* Subtle top glow line to match reference */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF394A]/30 to-transparent" />
        {/* Soft dark red top gradient bleed */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#FF394A]/5 dark:from-[#FF394A]/10 to-transparent" />

        <div className="relative flex items-center justify-between p-3 sm:p-6 lg:p-8">
          {/* Left column: Text & CTA */}
          <div className="max-w-md relative z-10">
            {!isMember && (
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#FF394A]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500/80">
                  Open Membership
                </span>
              </div>
            )}
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-3 sm:text-4xl">
              {isMember ? 'Welcome Back' : 'Join the Community'}
            </h2>
            <p className="mb-6 text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {isMember
                ? 'Head to your personal dashboard for stats, bounties, and progress.'
                : 'Apply for membership to access quests, earn XP, and grow with builders.'}
            </p>
            
            {isMember ? (
              <Link href="/member">
                <InteractiveHoverButton 
                  text="Dashboard"
                  className="text-[13px] text-zinc-900 dark:text-zinc-100"
                />
              </Link>
            ) : (
              <div onClick={() => setApplyOpen(true)}>
                <InteractiveHoverButton 
                  text="Apply Now"
                  className="text-[13px] text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}
          </div>

          {/* Right column: Image Logo */}
          <div className="hidden sm:block absolute right-[5%] top-1/2 -translate-y-1/2 select-none pointer-events-none mix-blend-multiply dark:mix-blend-screen opacity-90 transition-opacity">
            <Image
              src="/t1light.png"
              alt="Team1 Light"
              width={320}
              height={160}
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/t1dark.png"
              alt="Team1 Dark"
              width={320}
              height={160}
              className="object-contain hidden dark:block"
              priority
            />
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <MembershipApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </>
  );
}
