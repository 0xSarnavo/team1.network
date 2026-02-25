'use client';

import React from 'react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AuthGuard } from '@/components/layout/auth-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAdmin>
      <div className="flex h-screen overflow-hidden bg-zinc-950">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-black">{children}</main>
      </div>
    </AuthGuard>
  );
}
