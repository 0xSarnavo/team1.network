'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// ---------- Types ----------

interface Region {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  city: string | null;
  memberCount: number;
}

interface WorldMapProps {
  regions: Region[];
}

// ---------- Coordinate lookup (equirectangular projection, viewBox 1000x500) ----------
// To add a new region: calculate x = (lon + 180) * (1000/360), y = (90 - lat) * (500/180)

const REGION_COORDS: Record<string, { x: number; y: number }> = {
  India:     { x: 703, y: 197 },
  Dubai:     { x: 654, y: 180 },
  Singapore: { x: 789, y: 246 },
  Nigeria:   { x: 510, y: 232 },
  Turkey:    { x: 580, y: 136 },
};

// ---------- Simplified continent outlines ----------

const CONTINENTS = [
  // North America
  'M 55 70 L 70 55 L 100 50 L 140 48 L 175 55 L 200 50 L 230 55 L 260 65 L 275 80 L 280 100 L 270 115 L 275 135 L 265 155 L 255 170 L 240 185 L 225 195 L 210 190 L 195 200 L 180 210 L 170 200 L 155 195 L 145 185 L 135 170 L 128 155 L 120 140 L 110 125 L 95 110 L 80 95 L 65 85 Z',
  // Central America
  'M 170 200 L 180 210 L 190 225 L 195 240 L 200 250 L 195 255 L 185 250 L 175 240 L 168 230 L 165 220 L 165 210 Z',
  // South America
  'M 215 255 L 230 245 L 250 248 L 270 255 L 285 270 L 295 290 L 305 315 L 310 340 L 305 365 L 295 385 L 280 400 L 265 415 L 250 420 L 240 410 L 235 390 L 225 365 L 218 340 L 212 310 L 208 285 L 210 270 Z',
  // Europe
  'M 460 55 L 475 48 L 495 50 L 515 52 L 535 58 L 555 65 L 565 78 L 560 92 L 548 102 L 535 110 L 520 118 L 505 125 L 490 128 L 478 125 L 465 118 L 455 108 L 448 95 L 445 80 L 450 65 Z',
  // Africa
  'M 470 155 L 490 148 L 510 150 L 530 152 L 550 160 L 565 172 L 572 190 L 575 210 L 578 235 L 575 260 L 568 285 L 555 310 L 540 330 L 525 345 L 510 352 L 495 348 L 480 338 L 465 320 L 455 295 L 448 270 L 445 245 L 448 220 L 455 195 L 462 175 Z',
  // Asia (main landmass)
  'M 555 38 L 580 32 L 620 28 L 660 30 L 700 35 L 740 40 L 775 48 L 810 55 L 835 65 L 850 80 L 848 100 L 835 115 L 815 130 L 795 142 L 775 152 L 750 160 L 725 168 L 700 175 L 680 185 L 665 180 L 650 170 L 635 158 L 618 145 L 600 130 L 585 115 L 572 100 L 565 82 L 558 65 Z',
  // Southeast Asia islands
  'M 770 220 L 785 215 L 800 218 L 815 225 L 825 235 L 830 248 L 822 258 L 810 262 L 795 258 L 782 250 L 772 240 L 768 230 Z',
  // Australia
  'M 800 310 L 825 298 L 855 295 L 878 302 L 892 318 L 895 338 L 885 355 L 868 368 L 848 372 L 828 365 L 812 352 L 802 335 L 798 322 Z',
];

export function WorldMap({ regions }: WorldMapProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const mapped = regions
    .map((r) => ({ ...r, coords: REGION_COORDS[r.name] }))
    .filter((r): r is typeof r & { coords: { x: number; y: number } } => !!r.coords);

  return (
    <svg
      viewBox="0 0 1000 500"
      className="w-full h-auto"
      role="img"
      aria-label="World map showing active regions"
    >
      {/* Subtle grid */}
      {[100, 200, 300, 400].map((y) => (
        <line key={`h${y}`} x1={0} y1={y} x2={1000} y2={y} stroke="rgb(39,39,42)" strokeWidth={0.5} opacity={0.25} />
      ))}
      {[200, 400, 600, 800].map((x) => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={500} stroke="rgb(39,39,42)" strokeWidth={0.5} opacity={0.25} />
      ))}

      {/* Continent outlines */}
      {CONTINENTS.map((d, i) => (
        <path key={i} d={d} fill="rgba(63,63,70,0.15)" stroke="rgb(63,63,70)" strokeWidth={1} opacity={0.5} />
      ))}

      {/* Region dots */}
      {mapped.map((r) => (
        <g key={r.id}>
          {/* Pulse ring */}
          <circle
            cx={r.coords.x}
            cy={r.coords.y}
            r={5}
            fill="rgb(239,68,68)"
            className="map-dot-pulse"
          />
          {/* Glow */}
          <circle cx={r.coords.x} cy={r.coords.y} r={8} fill="rgb(239,68,68)" opacity={0.15} />
          {/* Core dot */}
          <circle
            cx={r.coords.x}
            cy={r.coords.y}
            r={5}
            fill="rgb(239,68,68)"
            stroke="rgb(252,165,165)"
            strokeWidth={1.5}
          />
          {/* Hit area */}
          <circle
            cx={r.coords.x}
            cy={r.coords.y}
            r={22}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHovered(r.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => router.push(`/portal/regions/${r.slug}`)}
          />

          {/* Label (always visible on desktop) */}
          <text
            x={r.coords.x}
            y={r.coords.y - 14}
            textAnchor="middle"
            fill="rgb(161,161,170)"
            fontSize={11}
            fontWeight={500}
            className="pointer-events-none select-none hidden md:block"
            style={{ display: undefined }}
          >
            {r.name}
          </text>
        </g>
      ))}

      {/* Tooltip on hover */}
      {hovered && (() => {
        const r = mapped.find((r) => r.id === hovered);
        if (!r) return null;

        const tooltipW = 140;
        const tooltipH = 52;
        // Position tooltip: prefer right, flip if near edge
        const tx = r.coords.x + 25 + tooltipW > 1000 ? r.coords.x - tooltipW - 15 : r.coords.x + 15;
        const ty = r.coords.y - tooltipH / 2;

        return (
          <g className="pointer-events-none">
            <rect
              x={tx}
              y={ty}
              width={tooltipW}
              height={tooltipH}
              rx={8}
              fill="rgb(24,24,27)"
              stroke="rgb(63,63,70)"
              strokeWidth={1}
            />
            <text x={tx + 12} y={ty + 20} fill="rgb(244,244,245)" fontSize={13} fontWeight={600}>
              {r.name}
            </text>
            <text x={tx + 12} y={ty + 38} fill="rgb(161,161,170)" fontSize={11}>
              {r.memberCount} {r.memberCount === 1 ? 'member' : 'members'}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
