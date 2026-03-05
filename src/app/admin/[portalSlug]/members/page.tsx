'use client';

import React, { use, useState } from 'react';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { UserPlus, Check, X, ChevronDown } from 'lucide-react';

interface MemberData {
  membershipId: string;
  user: {
    id: string;
    email: string;
    username: string | null;
    displayName: string;
    avatarUrl: string | null;
    level: number;
  };
  role: string;
  status: string;
  isPrimary: boolean;
  appliedAt: string;
  acceptedAt: string | null;
  isActive: boolean;
}

interface RegionAdminData {
  region: { id: string; name: string; slug: string };
  stats: { totalMembers: number; pendingMembers: number; totalEvents: number };
  members: MemberData[];
}

const ROLE_OPTIONS = ['member', 'co_lead', 'lead'];

export default function RegionAdminMembersPage({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = use(params);
  const slug = portalSlug.replace(/^portal-/, '');
  const { data, loading, refetch } = useApi<RegionAdminData>(
    `/api/portal/regions/${slug}/manage`,
  );
  const { mutate: postMember, loading: addingMember } = useMutation<unknown>('post');
  const { mutate: putMember } = useMutation<unknown>('put');
  const { mutate: deleteMember } = useMutation<unknown>('delete');

  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('member');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');

  if (loading || !data) return <PageLoader />;

  const filteredMembers = data.members.filter(m => {
    if (filter === 'pending') return m.status === 'pending';
    if (filter === 'accepted') return m.status === 'accepted' && m.isActive;
    return true;
  });

  const handleAdd = async () => {
    if (!addEmail.trim()) return;
    const res = await postMember(`/api/portal/regions/${slug}/manage`, {
      email: addEmail.trim(),
      role: addRole,
    });
    if (res.success) {
      setAddEmail('');
      setShowAddForm(false);
      refetch();
    }
  };

  const handleAccept = async (memberId: string) => {
    await putMember(`/api/portal/regions/${slug}/manage/${memberId}`, { role: 'member' });
    refetch();
  };

  const handleReject = async (memberId: string) => {
    await deleteMember(`/api/portal/regions/${slug}/manage/${memberId}`);
    refetch();
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    await putMember(`/api/portal/regions/${slug}/manage/${memberId}`, { role: newRole });
    refetch();
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this member?')) return;
    await deleteMember(`/api/portal/regions/${slug}/manage/${memberId}`);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Members</h1>
          <p className="text-sm text-zinc-500">
            {data.stats.totalMembers} active &middot; {data.stats.pendingMembers} pending
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <Card>
          <CardContent className="flex flex-wrap items-end gap-3 py-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs font-medium text-zinc-500">Email</label>
              <Input
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="w-36">
              <label className="mb-1 block text-xs font-medium text-zinc-500">Role</label>
              <select
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-card px-3 text-sm dark:border-zinc-800"
              >
                {ROLE_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={addingMember}
              className="h-10 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {addingMember ? 'Adding...' : 'Add'}
            </button>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'accepted'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === f
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <EmptyState title="No members found" description={`No ${filter} members in this region.`} />
      ) : (
        <Card>
          <CardContent className="divide-y divide-zinc-100 p-0 dark:divide-zinc-800">
            {filteredMembers.map((m) => (
              <div key={m.membershipId} className="flex items-center gap-4 px-4 py-3">
                <Avatar src={m.user.avatarUrl} alt={m.user.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {m.user.displayName}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{m.user.email}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  m.status === 'pending'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {m.status}
                </span>

                {m.status === 'pending' ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAccept(m.membershipId)}
                      className="rounded-lg p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="Accept"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleReject(m.membershipId)}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.membershipId, e.target.value)}
                        className="appearance-none rounded-lg border border-zinc-200 bg-card py-1 pl-2 pr-6 text-xs font-medium dark:border-zinc-800"
                      >
                        {ROLE_OPTIONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => handleRemove(m.membershipId)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
