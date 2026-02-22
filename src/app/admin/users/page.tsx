'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { api } from '@/lib/api/client';
import { useToast } from '@/lib/context/toast-context';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/spinner';

interface User {
  id: string;
  displayName: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  isActive: boolean;
  platformRole: string | null;
  createdAt: string;
  regions: { id: string; name: string; slug: string; role: string }[];
}

export default function UsersAdminPage() {
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: users, loading, pagination, refetch } = useApi<User[]>(
    `/api/admin/users?page=${page}&limit=20&search=${search}`
  );

  // Create user form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', displayName: '', username: '' });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await api.post('/api/admin/users', createForm);
    if (res.success) {
      addToast('success', 'User created successfully');
      setShowCreate(false);
      setCreateForm({ email: '', password: '', displayName: '', username: '' });
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to create user');
    }
    setCreating(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Users</h1>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : 'Create User'}
        </Button>
      </div>

      {/* Create User Form */}
      {showCreate && (
        <Card className="mb-6">
          <CardTitle>Create New User</CardTitle>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" required />
            <Input label="Display Name" value={createForm.displayName} onChange={(e) => setCreateForm(f => ({ ...f, displayName: e.target.value }))} required />
            <Input label="Username (optional)" value={createForm.username} onChange={(e) => setCreateForm(f => ({ ...f, username: e.target.value }))} />
            <div className="sm:col-span-2">
              <Button type="submit" loading={creating}>Create User</Button>
            </div>
          </form>
        </Card>
      )}

      <Input
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search by name, email, or username..."
        className="mb-4 max-w-md"
      />

      {loading ? <PageLoader /> : (
        <div className="space-y-2">
          {(users || []).map((u) => (
            <Link key={u.id} href={`/admin/users/${u.id}`}>
              <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 hover:border-zinc-700 transition-colors cursor-pointer">
                <Avatar src={u.avatarUrl} alt={u.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-200 truncate">{u.displayName}</p>
                    {u.platformRole && <Badge variant="danger">{u.platformRole.replace(/_/g, ' ')}</Badge>}
                    {!u.isActive && <Badge variant="danger">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-zinc-500 truncate">{u.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-500">
                  <span>Lv.{u.level}</span>
                  <span>{u.totalXp} XP</span>
                  {u.regions.length > 0 && (
                    <div className="flex gap-1">
                      {u.regions.map(r => (
                        <Badge key={r.id} variant="default">{r.name} ({r.role})</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-zinc-600">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="flex items-center text-sm text-zinc-500">Page {page} of {pagination.totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
