'use client';

import React, { useRef, useEffect } from 'react';

interface DarkVeilProps {
  hueShift?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  speed?: number;
  scanlineFrequency?: number;
  warpAmount?: number;
  className?: string;
}

export function DarkVeil({
  hueShift = 232,
  noiseIntensity = 0.05,
  scanlineIntensity = 0.2,
  speed = 0.5,
  scanlineFrequency = 0.5,
  warpAmount = 0.5,
  className = '',
}: DarkVeilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      // Background base
      ctx.fillStyle = `hsl(${hueShift}, 20%, 5%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Noise
      const idata = ctx.createImageData(canvas.width, canvas.height);
      const data = idata.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseIntensity * 255;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        data[i + 3] = 255;
      }
      ctx.putImageData(idata, 0, 0);

      // Scanlines & Warp
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = `rgba(0, 0, 0, ${scanlineIntensity})`;
      for (let y = 0; y < canvas.height; y += 4 / scanlineFrequency) {
        // Subtle vertical movement based on time and warp
        const warpOffsetY = Math.sin(time * speed + y * 0.01) * warpAmount * 20;
        ctx.fillRect(0, y + warpOffsetY, canvas.width, 1);
      }
      
      // Moving gradient highlight
      const gradient = ctx.createLinearGradient(0, (time * speed * 100) % (canvas.height * 2) - canvas.height, 0, ((time * speed * 100) % (canvas.height * 2) - canvas.height) + canvas.height);
      gradient.addColorStop(0, `hsla(${hueShift}, 50%, 50%, 0)`);
      gradient.addColorStop(0.5, `hsla(${hueShift}, 50%, 50%, 0.1)`);
      gradient.addColorStop(1, `hsla(${hueShift}, 50%, 50%, 0)`);
      
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'source-over';

      time += 0.01;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hueShift, noiseIntensity, scanlineIntensity, speed, scanlineFrequency, warpAmount]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none block h-full w-full ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
      }}
    />
  );
}
