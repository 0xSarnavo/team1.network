'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

interface Member { id: string; userId: string; user: { displayName: string; avatarUrl: string | null; email: string }; regionName: string; status: string; appliedAt: string; }

export default function MembersAdminPage() {
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: members, loading, pagination, refetch } = useApi<Member[]>(
    `/api/portal/admin/members?page=${page}&search=${search}&status=${statusFilter}`
  );

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await api.put(`/api/portal/admin/members/${id}`, { status: action === 'approve' ? 'accepted' : 'rejected' });
    if (res.success) { addToast('success', `Member ${action}d`); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Members</h1>
      <div className="mb-4 flex gap-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="max-w-xs" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <DataTable columns={[
        { key: 'user', header: 'Member', render: (r) => {
          const m = r as unknown as Member;
          return (<div className="flex items-center gap-2"><Avatar src={m.user.avatarUrl} alt={m.user.displayName} size="sm" /><div><p className="text-sm text-zinc-200">{m.user.displayName}</p><p className="text-xs text-zinc-500">{m.user.email}</p></div></div>);
        }},
        { key: 'regionName', header: 'Region' },
        { key: 'status', header: 'Status', render: (r) => <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}>{r.status as string}</Badge> },
        { key: 'appliedAt', header: 'Applied', render: (r) => <span className="text-sm text-zinc-500">{new Date(r.appliedAt as string).toLocaleDateString()}</span> },
        { key: 'actions', header: '', render: (r) => r.status === 'pending' ? (
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => handleAction(r.id as string, 'approve')}>Approve</Button>
            <Button variant="ghost" size="sm" onClick={() => handleAction(r.id as string, 'reject')}>Reject</Button>
          </div>
        ) : null },
      ]} data={(members || []) as unknown as Record<string, unknown>[]} loading={loading} pagination={pagination ? { page, totalPages: pagination.totalPages, onPageChange: setPage } : undefined} />
    </div>
  );
}
