'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';

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

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-zinc-200 bg-white dark:border-zinc-800/80 dark:bg-[#0f0a0a]">
      {/* Subtle top glow line to match reference */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF394A]/30 to-transparent" />
      {/* Soft dark red top gradient bleed */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#FF394A]/5 dark:from-[#FF394A]/10 to-transparent" />

      <div className="relative flex items-center justify-between p-8 sm:p-10">
        {/* Left column: Text & CTA */}
        <div className="max-w-md">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2 sm:text-[22px]">
            {isMember ? 'Welcome Back' : 'Join the Community'}
          </h2>
          <p className="mb-6 text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {isMember
              ? 'Head to your personal dashboard for stats, bounties, and progress.'
              : 'Apply for membership to access quests, earn XP, and grow with builders.'}
          </p>
          
          <Link
            href={isMember ? '/member' : '/portal/membership'}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF394A] px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-95"
          >
            {isMember ? 'Dashboard' : 'Apply Now'}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </Link>
        </div>

        {/* Right column: Logo with float animation */}
        <div className="hidden sm:block absolute right-12 top-1/2 -translate-y-1/2">
          <div className="relative animate-[float_6s_ease-in-out_infinite]">
            <svg
              width="120"
              height="120"
              viewBox="0 0 30 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative drop-shadow-[0_0_15px_rgba(255,57,74,0.15)] text-zinc-900 dark:text-white"
            >
              <g clipPath="url(#clip0_383_6787)">
                <path
                  d="M3.00521 31.9955C2.25928 31.9955 1.51442 32.0011 0.76849 31.9943C0.0872356 31.9876 -0.179014 31.5066 0.161613 30.8822C2.71201 26.208 5.26564 21.536 7.82251 16.8663C8.14588 16.2758 8.6773 16.2691 9.00283 16.8562C9.77035 18.237 10.527 19.6257 11.2784 21.0167C11.5478 21.5146 11.5403 22.0272 11.2665 22.5285C9.68303 25.4279 8.09847 28.3272 6.5128 31.2255C6.23254 31.7369 5.81 31.9989 5.24083 31.9966C4.49492 31.9932 3.75008 31.9966 3.00413 31.9966L3.00521 31.9955Z"
                  fill="currentColor"
                />
                <path
                  d="M13.6422 31.9977C12.7485 31.9977 11.8538 32.0023 10.9602 31.9966C10.2305 31.9921 9.97393 31.5157 10.3437 30.8495C11.22 29.2722 12.0996 27.6961 12.9835 26.1222C13.3716 25.4324 13.9084 25.4312 14.2943 26.1188C15.1771 27.6927 16.0567 29.2677 16.9342 30.8461C17.3104 31.5224 17.0452 31.9943 16.2896 31.9977C15.4067 32.0011 14.5239 31.9977 13.6422 31.9977Z"
                  fill="currentColor"
                />
                <path
                  d="M29.9945 0.707995V15.1631C29.9945 15.4778 29.7507 15.7332 29.4503 15.7332H24.8786C24.5782 15.7332 24.3344 15.4778 24.3344 15.1631V6.49848C24.3344 6.18384 24.0906 5.92847 23.7902 5.92847H20.6336C20.3332 5.92847 20.0894 5.67309 20.0894 5.35841V0.570045C20.0894 0.25538 20.3332 0 20.6336 0H29.3186C29.6919 0 29.9945 0.316944 29.9945 0.707995Z"
                  fill="#FF394A"
                />
                <path
                  d="M29.9999 26.6233V31.4117C29.9999 31.7264 29.7561 31.9818 29.4557 31.9818H23.518C19.7638 31.9818 16.7204 28.7941 16.7204 24.8619V16.9326C16.7204 16.6179 16.4766 16.3625 16.1762 16.3625H13.0599C12.7594 16.3625 12.5156 16.1072 12.5156 15.7925V11.0041C12.5156 10.6895 12.7594 10.4341 13.0599 10.4341H16.1762C16.4766 10.4341 16.7204 10.1787 16.7204 9.86406V8.60997C16.7204 8.2953 16.9642 8.03992 17.2647 8.03992H21.8363C22.1367 8.03992 22.3805 8.2953 22.3805 8.60997V24.6784C22.3805 25.4377 22.9683 26.0533 23.6932 26.0533H29.4557C29.7561 26.0533 29.9999 26.3087 29.9999 26.6233Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_383_6787">
                  <rect width="30" height="32" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
