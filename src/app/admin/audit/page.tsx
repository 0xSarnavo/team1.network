'use client';

import React, { useState } from 'react';
import { useApi } from '@/lib/hooks/use-api';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';

interface AuditLog { id: string; userId: string; userName: string | null; module: string; action: string; severity: string; details: string | null; createdAt: string; }

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [module, setModule] = useState('');
  const [severity, setSeverity] = useState('');
  const [search, setSearch] = useState('');
  const { data: logs, loading, pagination } = useApi<AuditLog[]>(
    `/api/admin/audit?page=${page}&module=${module}&severity=${severity}&search=${search}`
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Audit Log</h1>
      <div className="mb-4 flex flex-wrap gap-3">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="max-w-xs" />
        <select value={module} onChange={(e) => setModule(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
          <option value="">All Modules</option>
          <option value="auth">Auth</option><option value="portal">Portal</option><option value="home">Home</option>
          <option value="grants">Grants</option><option value="bounty">Bounty</option><option value="ecosystem">Ecosystem</option>
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
          <option value="">All Severity</option>
          <option value="normal">Normal</option><option value="sensitive">Sensitive</option><option value="critical">Critical</option>
        </select>
      </div>
      <DataTable columns={[
        { key: 'createdAt', header: 'Time', render: (r) => <span className="text-xs text-zinc-500">{new Date(r.createdAt as string).toLocaleString()}</span> },
        { key: 'userName', header: 'User' },
        { key: 'module', header: 'Module', render: (r) => <Badge variant="default">{r.module as string}</Badge> },
        { key: 'action', header: 'Action' },
        { key: 'severity', header: 'Severity', render: (r) => (
          <Badge variant={r.severity === 'critical' ? 'danger' : r.severity === 'sensitive' ? 'warning' : 'default'}>
            {r.severity as string}
          </Badge>
        )},
        { key: 'details', header: 'Details', render: (r) => <span className="text-xs text-zinc-500 truncate max-w-[200px] block">{r.details as string || '—'}</span> },
      ]} data={(logs || []) as unknown as Record<string, unknown>[]} loading={loading} pagination={pagination ? { page, totalPages: pagination.totalPages, onPageChange: setPage } : undefined} />
    </div>
  );
}
