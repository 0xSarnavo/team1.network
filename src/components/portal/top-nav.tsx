import React from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/navigation';
import { useApi } from '@/lib/hooks/use-api';

interface TopNavProps {
  currentRegion?: { id: string; name: string; slug: string };
}

export function PortalTopNav({ currentRegion }: TopNavProps) {
  const router = useRouter();
  const { data: hub } = useApi<{ regions: { id: string; name: string; slug: string }[] }>('/api/portal');
  const regions = hub?.regions || [];

  
  return (
    <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Search Bar */}
      <div className="relative w-full lg:col-span-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full rounded-full border border-zinc-200 bg-white/50 pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-400"
        />
      </div>

      {/* Region Toggle */}
      <div className="w-full lg:col-span-4 flex justify-end">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex w-full items-center justify-between rounded-full border border-zinc-200 bg-white/50 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800">
              <span className="truncate">{currentRegion ? currentRegion.name : 'Global'}</span>
              <ChevronDown className="ml-2 h-4 w-4 text-zinc-500 flex-shrink-0" />
            </button>
          </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content 
            align="end" 
            className="z-50 min-w-[12rem] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="p-1">
              <DropdownMenu.Item 
                className={`relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800 ${!currentRegion ? 'text-red-600 dark:text-red-400 font-medium' : 'text-zinc-700 dark:text-zinc-300'}`}
                onSelect={() => router.push('/portal')}
              >
                Global
                {!currentRegion && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenu.Item>
              
              <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              
              <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Regions</div>
              
              {regions.map((region) => (
                <DropdownMenu.Item 
                  key={region.id}
                  className={`relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800 ${currentRegion?.id === region.id ? 'text-red-600 dark:text-red-400 font-medium' : 'text-zinc-700 dark:text-zinc-300'}`}
                  onSelect={() => router.push(`/portal/regions/${region.slug}`)}
                >
                  {region.name}
                  {currentRegion?.id === region.id && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenu.Item>
              ))}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      </div>
    </div>
  );
}
