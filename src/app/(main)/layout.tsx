'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Navbar } from '@/components/layout/navbar';
import FaultyTerminal from '@/components/ui/faulty-terminal';
import { RegionFilterProvider } from '@/components/portal/region-filter-context';
import { GrantTabProvider } from '@/components/grants/grant-tab-context';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  
  const excludedRoutes = ['/', '/portal', '/grants', '/bounty', '/ecosystem'];
  const isExcluded = excludedRoutes.some(route => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );

  return (
    <RegionFilterProvider>
      <GrantTabProvider>
      <div className="relative min-h-screen">
        {!isExcluded && (
          <div className="absolute inset-0 z-0 pointer-events-none fixed">
            <FaultyTerminal
              theme={resolvedTheme === 'light' ? 'light' : 'dark'}
              scale={4}
              gridMul={[3, 3]}
              digitSize={2}
              timeScale={0.5}
              pause={false}
              scanlineIntensity={0}
              glitchAmount={1}
              flickerAmount={0.2}
              noiseAmp={0.6}
              chromaticAberration={0}
              dither={0}
              curvature={0}
              tint="#ffffff"
              mouseReact
              mouseStrength={0.5}
              pageLoadAnimation={false}
              brightness={1}
            />
            <div className="absolute inset-0 bg-white/70 dark:bg-black/40 backdrop-blur-[1px]" />
          </div>
        )}
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </GrantTabProvider>
    </RegionFilterProvider>
  );
}

