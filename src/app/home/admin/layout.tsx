'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AuthGuard } from '@/components/layout/auth-guard';

export default function HomeAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireModule="home">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
