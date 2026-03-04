'use client';

import { useEffect, useRef } from 'react';
import { HeroTypography } from '@/components/home/hero-typography';


export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const heroEl = heroRef.current;
    if (!scrollContainer || !heroEl) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const windowHeight = scrollContainer.clientHeight;
      // Progress from 0 to 1 as we scroll through the first viewport height
      const progress = Math.min(scrollTop / windowHeight, 1);
      heroEl.style.opacity = String(1 - progress);
      heroEl.style.transform = `scale(${1 - progress * 0.05})`;
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative w-full h-[100dvh] shrink-0 bg-white dark:bg-zinc-950"
        style={{ scrollSnapAlign: 'start' }}
      >
        <HeroTypography />
      </section>

    </div>
  );
}
