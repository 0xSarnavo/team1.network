'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type GrantTab = 'discover' | 'details' | 'faq' | 'submissions';

interface GrantTabContextValue {
  activeTab: GrantTab;
  setActiveTab: (tab: GrantTab) => void;
}

const GrantTabCtx = createContext<GrantTabContextValue | null>(null);

export function useGrantTab() {
  return useContext(GrantTabCtx);
}

export function GrantTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<GrantTab>('details');
  return (
    <GrantTabCtx.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </GrantTabCtx.Provider>
  );
}
