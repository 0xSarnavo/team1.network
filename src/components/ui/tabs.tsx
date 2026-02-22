'use client';

import React, { useState } from 'react';

interface Tab {
  key: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-zinc-800 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active === tab.key
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab?.content}
    </div>
  );
}
