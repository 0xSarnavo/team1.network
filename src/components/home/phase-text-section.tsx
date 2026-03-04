'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = [
  'DEVELOPERS',
  'DESIGNERS',
  'MARKETERS',
  'CREATORS',
  'TRADERS',
  'GAMERS',
  'FOUNDERS',
  'INNOVATORS',
  'VISIONARIES'
];

export default function PhaseTextSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full h-[100dvh] overflow-hidden bg-black text-white flex items-center justify-center uppercase font-black"
      style={{ fontFamily: "'Pprader', sans-serif" }}
    >
      {/* Container box — matches the blue-bordered area in mockup */}
      <div
        className="w-[calc(100%-3rem)] sm:w-[calc(100%-4rem)] md:w-[calc(100%-6rem)] lg:w-[calc(100%-10rem)] max-w-[1400px] flex flex-col tracking-tighter leading-[0.9]"
        style={{ fontSize: 'clamp(2.2rem, 5.8vw, 7.5rem)' }}
      >
        {/* Line 1: WE ARE A ... GLOBAL */}
        <div className="flex w-full justify-between items-baseline">
          <span>WE ARE A</span>
          <span>GLOBAL</span>
        </div>

        {/* Line 2: NETWORK OF (right-aligned, indented from left) */}
        <div className="flex w-full justify-end" style={{ paddingRight: '10%' }}>
          <span>NETWORK OF</span>
        </div>

        {/* Line 3: <WORD> rotating text — pinned to right */}
        <div className="flex w-full justify-end" style={{ paddingRight: '5%' }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={WORDS[currentWordIndex]}
              className="text-[#FF394A] inline-block text-right"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              &lt;{WORDS[currentWordIndex]}&gt;
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Spacer between groups */}
        <div className="h-[2vh] sm:h-[3vh]" />

        {/* Line 4: BRING AVALANCHE (left-aligned) */}
        <div className="flex w-full justify-start">
          <span>BRING AVALANCHE</span>
        </div>

        {/* Line 5: TO EVERYONE (right-aligned) */}
        <div className="flex w-full justify-end">
          <span>TO EVERYONE</span>
        </div>

        {/* Spacer between groups */}
        <div className="h-[3vh] sm:h-[5vh]" />

        {/* Line 6: ONBOARD → BUILD → GROW */}
        <div className="flex w-full items-center">
          <span>ONBOARD</span>
          <span className="font-sans font-light tracking-normal mx-[0.3em]">→</span>
          <span>BUILD</span>
          <span className="font-sans font-light tracking-normal mx-[0.3em]">→</span>
          <span>GROW</span>
        </div>
      </div>
    </div>
  );
}
