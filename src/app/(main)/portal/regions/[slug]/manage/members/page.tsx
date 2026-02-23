'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface RegionUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
}

interface RegionMember {
  membershipId: string;
  user: RegionUser;
  role: string;
  status: string;
  isPrimary: boolean;
  appliedAt: string;
  acceptedAt: string | null;
  isActive: boolean;
}

interface RegionManageData {
  region: { id: string; name: string; slug: string };
  stats: { totalMembers: number; pendingMembers: number; totalEvents: number };
  members: RegionMember[];
}

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member' },
  { value: 'ambassador', label: 'Ambassador' },
  { value: 'lead', label: 'Lead' },
  { value: 'co_lead', label: 'Co-Lead' },
];

const roleBadgeVariant = (role: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
  switch (role) {
    case 'lead': return 'danger';
    case 'co_lead': return 'warning';
    case 'ambassador': return 'info';
    default: return 'default';
  }
};

const statusBadgeVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
  switch (status) {
    case 'accepted': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'danger';
    default: return 'default';
  }
};

export default function RegionMembersPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToast } = useToast();

  const { data, loading, error, refetch } = useApi<RegionManageData>(`/api/portal/regions/${slug}/manage`);

  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('member');
  const [addLoading, setAddLoading] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRoleValue, setEditingRoleValue] = useState('member');
  const [roleLoading, setRoleLoading] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);

  const activeMembers = useMemo(
    () => (data?.members ?? []).filter((m) => m.status === 'accepted'),
    [data?.members],
  );
  const pendingMembers = useMemo(
    () => (data?.members ?? []).filter((m) => m.status === 'pending'),
    [data?.members],
  );

  const handleAddMember = async () => {
    const email = addEmail.trim();
    if (!email) { addToast('error', 'Please enter an email'); return; }
    setAddLoading(true);
    const res = await api.post(`/api/portal/regions/${slug}/manage`, { email, role: addRole });
    if (res.success) { addToast('success', 'Member added'); setAddEmail(''); setAddRole('member'); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setAddLoading(false);
  };

  const handleChangeRole = async (memberId: string) => {
    setRoleLoading(true);
    const res = await api.put(`/api/portal/regions/${slug}/manage/${memberId}`, { role: editingRoleValue });
    if (res.success) { addToast('success', 'Role updated'); setEditingRoleId(null); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setRoleLoading(false);
  };

  const handleRemoveMember = async () => {
    if (!removeMemberId) return;
    setRemoveLoading(true);
    const res = await api.delete(`/api/portal/regions/${slug}/manage/${removeMemberId}`);
    if (res.success) { addToast('success', 'Member removed'); setRemoveMemberId(null); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setRemoveLoading(false);
  };

  const handleAcceptMember = async (member: RegionMember) => {
    setAcceptLoading(member.membershipId);
    const res = await api.post(`/api/portal/regions/${slug}/manage`, { email: member.user.email, role: 'member' });
    if (res.success) { addToast('success', `${member.user.displayName} accepted`); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setAcceptLoading(null);
  };

  const handleRejectMember = async (member: RegionMember) => {
    setRejectLoading(member.membershipId);
    const res = await api.delete(`/api/portal/regions/${slug}/manage/${member.membershipId}`);
    if (res.success) { addToast('success', `${member.user.displayName} rejected`); refetch(); }
    else addToast('error', res.error?.message || 'Failed');
    setRejectLoading(null);
  };

  if (loading) return <PageLoader />;
  if (error || !data) return <p className="text-red-400">{error || 'Failed to load'}</p>;

  return (
    <div>
      {/* Add Member */}
      <Card className="mb-8">
        <CardTitle>Add Member</CardTitle>
        <p className="mt-1 text-sm text-zinc-500">Invite a user directly by email address.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input label="Email" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="user@example.com" className="sm:max-w-xs" />
          <Select label="Role" value={addRole} onChange={(e) => setAddRole(e.target.value)} options={ROLE_OPTIONS} className="sm:max-w-[160px]" />
          <Button onClick={handleAddMember} loading={addLoading}>Add Member</Button>
        </div>
      </Card>

      {/* Pending */}
      {pendingMembers.length > 0 && (
        <Card className="mb-8">
          <CardTitle>Pending Applications <Badge variant="warning" className="ml-2">{pendingMembers.length}</Badge></CardTitle>
          <CardContent className="mt-4 space-y-3">
            {pendingMembers.map((member) => (
              <div key={member.membershipId} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar src={member.user.avatarUrl} alt={member.user.displayName || member.user.username} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{member.user.displayName || member.user.username}</p>
                    <p className="text-xs text-zinc-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mr-2 text-xs text-zinc-600">Applied {new Date(member.appliedAt).toLocaleDateString()}</span>
                  <Button variant="primary" size="sm" loading={acceptLoading === member.membershipId} onClick={() => handleAcceptMember(member)}>Accept</Button>
                  <Button variant="ghost" size="sm" loading={rejectLoading === member.membershipId} onClick={() => handleRejectMember(member)}>Reject</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Members Table */}
      <Card>
        <CardTitle>Members ({activeMembers.length})</CardTitle>
        <CardContent className="mt-4">
          {activeMembers.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-600">No active members yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
                    <th className="pb-3 pr-4 font-medium">Member</th>
                    <th className="pb-3 pr-4 font-medium">Role</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Joined</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {activeMembers.map((member) => (
                    <tr key={member.membershipId}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={member.user.avatarUrl} alt={member.user.displayName || member.user.username} size="sm" />
                          <div>
                            <p className="font-medium text-zinc-200">{member.user.displayName || member.user.username}</p>
                            <p className="text-xs text-zinc-500">{member.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        {editingRoleId === member.membershipId ? (
                          <div className="flex items-center gap-2">
                            <select value={editingRoleValue} onChange={(e) => setEditingRoleValue(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500">
                              {ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <Button variant="primary" size="sm" loading={roleLoading} onClick={() => handleChangeRole(member.membershipId)}>Save</Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingRoleId(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Badge variant={roleBadgeVariant(member.role)}>
                            {member.role === 'co_lead' ? 'Co-Lead' : member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusBadgeVariant(member.status)}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-500">
                        {member.acceptedAt ? new Date(member.acceptedAt).toLocaleDateString() : new Date(member.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingRoleId(member.membershipId); setEditingRoleValue(member.role); }}>Change Role</Button>
                          <Button variant="ghost" size="sm" onClick={() => setRemoveMemberId(member.membershipId)} className="text-red-400 hover:text-red-300">Remove</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog open={!!removeMemberId} onClose={() => setRemoveMemberId(null)} onConfirm={handleRemoveMember} title="Remove Member?" message="This member will be removed from the region. They can re-apply later." confirmLabel="Remove" confirmVariant="danger" loading={removeLoading} />
    </div>
  );
}
