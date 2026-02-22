'use client';

import React from 'react';
import { AuthProvider } from '@/lib/context/auth-context';
import { ToastProvider } from '@/lib/context/toast-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
