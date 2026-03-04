'use client';

import React, { createContext, useContext, useState } from 'react';

interface RegionOption {
  slug: string;
  name: string;
}

interface RegionFilterContextType {
  selectedRegion: string;
  setSelectedRegion: (slug: string) => void;
  regions: RegionOption[];
  setRegions: (regions: RegionOption[]) => void;
}

const RegionFilterContext = createContext<RegionFilterContextType | undefined>(undefined);

export function RegionFilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regions, setRegions] = useState<RegionOption[]>([]);

  return (
    <RegionFilterContext.Provider value={{ selectedRegion, setSelectedRegion, regions, setRegions }}>
      {children}
    </RegionFilterContext.Provider>
  );
}

export function useRegionFilter() {
  const ctx = useContext(RegionFilterContext);
  if (!ctx) throw new Error('useRegionFilter must be used within RegionFilterProvider');
  return ctx;
}

/** Safe version — returns null if outside provider (for navbar conditional use) */
export function useRegionFilterSafe() {
  return useContext(RegionFilterContext) ?? null;
}
