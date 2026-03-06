'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GlanceCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  delta: string;
  delay?: number;
}

export function GlanceCard({ icon: Icon, label, value, delta, delay = 0 }: GlanceCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 400;
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        setDisplayValue(Math.round(progress * value));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <div
      ref={ref}
      className="rounded-[10px] transition-colors"
      style={{
        background: 'var(--m-s1)',
        border: '1px solid var(--m-border)',
        padding: '14px 15px',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--m-bh)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--m-border)'; }}
    >
      {/* Top row: icon + delta */}
      <div className="flex items-center justify-between mb-2">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 26,
            height: 26,
            background: 'var(--m-s3)',
          }}
        >
          <Icon style={{ width: 12, height: 12, color: 'var(--m-sub)' }} />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 10,
            fontWeight: 500,
            color: 'var(--m-dim)',
          }}
        >
          {delta}
        </span>
      </div>

      {/* Value */}
      <p
        className="m-count"
        style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: 22,
          fontWeight: 500,
          color: 'var(--m-text)',
          lineHeight: 1.2,
        }}
      >
        {displayValue}
      </p>

      {/* Label */}
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 11,
          color: 'var(--m-sub)',
          marginTop: 2,
        }}
      >
        {label}
      </p>
    </div>
  );
}
