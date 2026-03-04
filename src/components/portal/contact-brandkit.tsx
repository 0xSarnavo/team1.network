'use client';

import React, { useState } from 'react';
import { BentoCard } from './bento-card';
import { Modal } from '@/components/ui/modal';

export function ContactBrandKit() {
  const [showContact, setShowContact] = useState(false);
  const [showBrandKit, setShowBrandKit] = useState(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {/* Contact */}
        <button onClick={() => setShowContact(true)} className="text-left group">
          <BentoCard className="h-full transition-all group-hover:border-zinc-300 dark:group-hover:border-zinc-700">
            <div className="flex flex-col items-center gap-2 py-2">
              <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Contact</h3>
              <p className="text-[10px] text-zinc-400">Get in touch</p>
            </div>
          </BentoCard>
        </button>

        {/* Brand Kit */}
        <button onClick={() => setShowBrandKit(true)} className="text-left group">
          <BentoCard className="h-full transition-all group-hover:border-zinc-300 dark:group-hover:border-zinc-700">
            <div className="flex flex-col items-center gap-2 py-2">
              <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Brand Kit</h3>
              <p className="text-[10px] text-zinc-400">Logos & assets</p>
            </div>
          </BentoCard>
        </button>
      </div>

      {/* Contact Modal */}
      <Modal open={showContact} onClose={() => setShowContact(false)} title="Contact" size="sm">
        <div className="space-y-3">
          {[
            { label: 'Email', value: 'contact@team1.network' },
            { label: 'Discord', value: 'Join our server' },
            { label: 'X', value: '@team1network' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-zinc-200/60 p-3 dark:border-zinc-800/60">
              <span className="text-xs font-black text-zinc-400">{item.label.charAt(0)}</span>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.label}</p>
                <p className="text-[10px] text-zinc-500">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Brand Kit Modal */}
      <Modal open={showBrandKit} onClose={() => setShowBrandKit(false)} title="Brand Kit" size="md">
        <div className="space-y-3">
          {[
            { label: 'Logo Pack', desc: 'SVG, PNG formats' },
            { label: 'Color Palette', desc: 'Brand colors & usage' },
            { label: 'Guidelines', desc: 'Typography, spacing, rules' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-zinc-200/60 p-3 dark:border-zinc-800/60">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-zinc-400">{item.label.charAt(0)}</span>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.label}</p>
                  <p className="text-[10px] text-zinc-500">{item.desc}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Soon</span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
