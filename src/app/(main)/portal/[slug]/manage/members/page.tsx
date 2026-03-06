'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
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
  if (error || !data) return <p className="text-sm text-[#FF394A]">{error || 'Failed to load'}</p>;

  return (
    <div>
      {/* Add Member */}
      <div className="mb-8 rounded-2xl border border-zinc-200/60 p-5 dark:border-zinc-800/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-1">Add Member</h3>
        <p className="text-[10px] text-zinc-500 mb-4">Invite a user directly by email address.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input label="Email" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="user@example.com" className="sm:max-w-xs" />
          <Select label="Role" value={addRole} onChange={(e) => setAddRole(e.target.value)} options={ROLE_OPTIONS} className="sm:max-w-[160px]" />
          <Button onClick={handleAddMember} loading={addLoading}>Add Member</Button>
        </div>
      </div>

      {/* Pending */}
      {pendingMembers.length > 0 && (
        <div className="mb-8 rounded-2xl border border-zinc-200/60 p-5 dark:border-zinc-800/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">
            Pending Applications <span className="text-[#FF394A] ml-1">{pendingMembers.length}</span>
          </h3>
          <div className="space-y-2">
            {pendingMembers.map((member) => (
              <div key={member.membershipId} className="flex items-center justify-between rounded-xl border border-zinc-200/60 px-4 py-3 dark:border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <Avatar src={member.user.avatarUrl} alt={member.user.displayName || member.user.username} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{member.user.displayName || member.user.username}</p>
                    <p className="text-[10px] text-zinc-400">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mr-2 text-[10px] text-zinc-400">Applied {new Date(member.appliedAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleAcceptMember(member)}
                    disabled={acceptLoading === member.membershipId}
                    className="rounded-full bg-zinc-900 px-4 py-1.5 text-[10px] font-bold text-white transition-all hover:opacity-90 dark:bg-white dark:text-zinc-900 disabled:opacity-50 active:scale-95"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectMember(member)}
                    disabled={rejectLoading === member.membershipId}
                    className="rounded-full px-4 py-1.5 text-[10px] font-bold text-zinc-500 transition-all hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Members Table */}
      <div className="rounded-2xl border border-zinc-200/60 p-5 dark:border-zinc-800/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4">Members ({activeMembers.length})</h3>
        {activeMembers.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">No active members yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200/60 dark:border-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-400">
                  <th className="pb-3 pr-4 font-bold">Member</th>
                  <th className="pb-3 pr-4 font-bold">Role</th>
                  <th className="pb-3 pr-4 font-bold">Status</th>
                  <th className="pb-3 pr-4 font-bold">Joined</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
                {activeMembers.map((member) => (
                  <tr key={member.membershipId}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={member.user.avatarUrl} alt={member.user.displayName || member.user.username} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{member.user.displayName || member.user.username}</p>
                          <p className="text-[10px] text-zinc-400">{member.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {editingRoleId === member.membershipId ? (
                        <div className="flex items-center gap-2">
                          <select value={editingRoleValue} onChange={(e) => setEditingRoleValue(e.target.value)} className="rounded-full border border-zinc-200 bg-transparent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600 outline-none dark:border-zinc-800 dark:text-zinc-400">
                            {ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          <button onClick={() => handleChangeRole(member.membershipId)} disabled={roleLoading} className="rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900 disabled:opacity-50">Save</button>
                          <button onClick={() => setEditingRoleId(null)} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Cancel</button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {member.role === 'co_lead' ? 'Co-Lead' : member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70">
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[10px] text-zinc-400">
                      {member.acceptedAt ? new Date(member.acceptedAt).toLocaleDateString() : new Date(member.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingRoleId(member.membershipId); setEditingRoleValue(member.role); }} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Change Role</button>
                        <button onClick={() => setRemoveMemberId(member.membershipId)} className="text-[10px] font-bold text-[#FF394A]/70 hover:text-[#FF394A]">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog open={!!removeMemberId} onClose={() => setRemoveMemberId(null)} onConfirm={handleRemoveMember} title="Remove Member?" message="This member will be removed from the region. They can re-apply later." confirmLabel="Remove" confirmVariant="danger" loading={removeLoading} />
    </div>
  );
}
