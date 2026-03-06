'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminRightSidebar } from '@/components/admin/admin-right-sidebar';
import { AuthGuard } from '@/components/layout/auth-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // portal-* routes have their own sidebar and layout
  const isRegionAdmin = pathname.startsWith('/admin/portal-');

  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const toggleTheme = () => setDark((d) => !d);

  if (!mounted) return null;

  return (
    <AuthGuard requireAdmin allowRegionLead>
      {isRegionAdmin ? (
        <>{children}</>
      ) : (
        <div
          className={`admin-shell ${dark ? '' : 'light'}`}
          style={{
            display: 'grid',
            gridTemplateColumns: '214px 1fr 240px',
            height: '100vh',
            overflow: 'hidden',
            background: 'var(--a-bg)',
            color: 'var(--a-text)',
          }}
        >
          <AdminSidebar dark={dark} onToggleTheme={toggleTheme} />
          <div className="flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
            {children}
          </div>
          <AdminRightSidebar />
        </div>
      )}
    </AuthGuard>
  );
}
