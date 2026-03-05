'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AuthGuard } from '@/components/layout/auth-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // portal-* routes have their own sidebar and layout
  const isRegionAdmin = pathname.startsWith('/admin/portal-');

  return (
    <AuthGuard requireAdmin allowRegionLead>
      {isRegionAdmin ? (
        // Region admin pages render their own layout via portal-[slug]/layout.tsx
        <>{children}</>
      ) : (
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
        </div>
      )}
    </AuthGuard>
  );
}
