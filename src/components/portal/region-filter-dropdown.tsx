'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegionFilter } from './region-filter-context';
import { motion, AnimatePresence } from 'framer-motion';

export function RegionFilterDropdown() {
  const router = useRouter();
  const { selectedRegion, setSelectedRegion, regions } = useRegionFilter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRegions = regions.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const currentRegionName = selectedRegion 
    ? regions.find(r => r.slug === selectedRegion)?.name 
    : 'All Regions';

  return (
    <div className="relative z-50 h-[36px] w-[120px] shrink-0" ref={containerRef}>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
      )}
      
      <AnimatePresence>
        <motion.div
          layout
          initial={false}
          animate={{
            height: isOpen ? 'auto' : 36,
            borderRadius: 12
          }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className={`group absolute left-0 top-0 w-[120px] min-w-[120px] overflow-hidden flex flex-col justify-start bg-white text-zinc-900 border border-zinc-200 origin-top dark:bg-zinc-950 dark:text-white dark:border-zinc-800 z-50 ${isOpen ? 'shadow-xl cursor-default' : 'hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer transition-colors duration-300'}`}
          onClick={() => !isOpen && setIsOpen(true)}
        >
          {/* Collapsed / Top Bar */}
          <div 
            className="w-full h-[36px] min-h-[36px] shrink-0 flex items-center justify-center px-3 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <span className="text-xs font-bold uppercase tracking-wider truncate">
              {currentRegionName === 'All Regions' ? 'Global' : currentRegionName || 'Global'}
            </span>
          </div>

          {/* Expanded State Items */}
          <div className={`flex flex-col w-full h-full transition-opacity duration-300 ${isOpen ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none'}`}>
            <div className="p-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
              <div className="relative">
                <svg className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search regions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md bg-zinc-100 py-1.5 pl-8 pr-3 text-sm font-medium text-zinc-900 placeholder-zinc-500 outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:ring-zinc-700 transition-colors"
                />
              </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto p-2 pt-1 flex flex-col gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRegion('');
                  setIsOpen(false);
                  setSearch('');
                  router.push('/portal/global');
                }}
                className={`flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                  selectedRegion === '' 
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white' 
                    : 'text-zinc-600 hover:bg-black hover:text-white dark:text-zinc-400 dark:hover:bg-white dark:hover:text-black'
                }`}
              >
                Global
              </button>
              {filteredRegions.length > 0 ? (
                filteredRegions.map((r) => (
                  <button
                    key={r.slug}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRegion(r.slug);
                      setIsOpen(false);
                      setSearch('');
                      router.push(`/portal/${r.slug}`);
                    }}
                    className={`flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                      selectedRegion === r.slug 
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white' 
                        : 'text-zinc-600 hover:bg-black hover:text-white dark:text-zinc-400 dark:hover:bg-white dark:hover:text-black'
                    }`}
                  >
                    {r.name}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-sm font-medium text-zinc-500 dark:text-zinc-500">
                  No regions found
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
