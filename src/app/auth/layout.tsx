import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="mb-8">
        <Link href="/" className="text-3xl font-bold text-red-500">
          team1
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-8 text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} team1 Network
      </p>
    </div>
  );
}
