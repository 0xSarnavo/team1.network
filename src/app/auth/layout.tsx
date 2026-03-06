import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {children}
      </div>
      <p className="mt-8 text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} team1 Network
      </p>
    </div>
  );
}
