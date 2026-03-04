'use client';

import React from 'react';

export function HeroTypography() {
  return (
    <div 
      className="absolute bottom-8 left-1/2 -translate-x-1/2 md:bottom-16 z-20 flex flex-col items-center w-full max-w-[1920px] font-black uppercase tracking-tight leading-[0.85] text-zinc-900 dark:text-zinc-50 pointer-events-none select-none"
      style={{ fontFamily: "'Pprader', sans-serif" }}
    >
      
      {/* Top Line */}
      <div className="flex w-full items-center justify-center gap-x-2 md:gap-x-4 text-[4.5vw] sm:text-[3rem] md:text-6xl lg:text-[5.5rem] px-4 font-black relative z-10 leading-[0.85] tracking-tighter">
        <span className="text-right flex-shrink-0">Network of</span>
        <span className="whitespace-nowrap">
          extraordinaries
        </span>
      </div>
      
      {/* Bottom Line */}
      <div className="flex w-full justify-center gap-3 sm:gap-6 mt-0 sm:mt-1 md:mt-2 text-[clamp(1.75rem,9vw,10.5rem)] tracking-tighter leading-none whitespace-nowrap px-4 md:px-8">
        <span>building</span>
        <span>avalanche</span>
      </div>
      
    </div>
  );
}
