'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/layout/auth-guard';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data: notifs, loading, pagination, refetch } = useApi<Notification[]>(`/api/notifications?page=${page}`);

  const markAsRead = async (ids: string[]) => {
    await api.post('/api/notifications/read', { ids });
    refetch();
  };

  const markAllRead = () => {
    if (notifs) markAsRead(notifs.filter((n) => !n.isRead).map((n) => n.id));
  };

  return (
    <AuthGuard>
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-100">Notifications</h1>
          <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
        </div>

        {loading ? <PageLoader /> : !notifs?.length ? (
          <EmptyState title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-2">
            {notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markAsRead([n.id])}
                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                  n.isRead ? 'border-zinc-800 bg-zinc-900/30' : 'border-red-900/50 bg-red-900/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${n.isRead ? 'text-zinc-400' : 'text-zinc-200'}`}>{n.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">{n.message}</p>
                  </div>
                  {!n.isRead && <div className="ml-3 h-2 w-2 rounded-full bg-red-500 shrink-0 mt-1.5" />}
                </div>
                <p className="mt-2 text-xs text-zinc-600">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="px-3 py-2 text-sm text-zinc-500">Page {page} of {pagination.totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
      <Footer />
    </AuthGuard>
  );
}
