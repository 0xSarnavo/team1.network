'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { DarkVeil } from '@/components/ui/dark-veil';

export function GlobalBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Only apply overlay if mounted to prevent hydration mismatch
  const isLightMode = mounted && resolvedTheme === 'light';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
      {/* 
        DarkVeil Base Layer.
        We always render it so it plays smoothly. 
      */}
      <DarkVeil
        hueShift={232}
        noiseIntensity={0}
        scanlineIntensity={0}
        speed={0.5}
        scanlineFrequency={0.5}
        warpAmount={0}
      />
      
      {/* 
        Light Mode Overlay 
        As requested: pure white with slight translucency to match ui cards 
      */}
      {isLightMode && (
        <div 
          className="absolute inset-0 z-[1] transition-opacity duration-500"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)' // For Safari
          }}
        />
      )}
    </div>
  );
}
