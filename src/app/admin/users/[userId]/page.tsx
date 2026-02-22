'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/use-api';
import { api } from '@/lib/api/client';
import { useToast } from '@/lib/context/toast-context';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RegionMembership {
  membershipId: string;
  regionId: string;
  regionName: string;
  regionSlug: string;
  role: string;
  status: string;
  isActive: boolean;
}

interface ModuleLead {
  module: string;
  isActive: boolean;
}

interface UserDetail {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  level: number;
  totalXp: number;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  platformRole: string;
  regions: RegionMembership[];
  moduleLeads: ModuleLead[];
  skills: string[];
  interests: string[];
}

interface Region {
  id: string;
  name: string;
  slug: string;
}

interface MembershipInfo {
  regions: Region[];
}

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member' },
  { value: 'ambassador', label: 'Ambassador' },
  { value: 'lead', label: 'Lead' },
  { value: 'co_lead', label: 'Co-Lead' },
];

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-36 shrink-0 text-sm font-medium text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-200">{children}</span>
    </div>
  );
}

function roleBadgeVariant(role: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (role) {
    case 'lead':
      return 'warning';
    case 'co_lead':
      return 'info';
    case 'ambassador':
      return 'success';
    default:
      return 'default';
  }
}

function formatRole(role: string): string {
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const userId = params.userId as string;

  // Fetch user detail
  const {
    data: user,
    loading,
    error,
    refetch,
  } = useApi<UserDetail>(`/api/admin/users/${userId}`);

  // Fetch available regions for assignment
  const { data: membershipInfo } = useApi<MembershipInfo>('/api/portal/membership/info');

  // Assign region state
  const [assignRegionId, setAssignRegionId] = useState('');
  const [assignRole, setAssignRole] = useState('member');
  const [assigning, setAssigning] = useState(false);

  // Change role state
  const [editingMembershipId, setEditingMembershipId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');

  // Action loading states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [togglingActive, setTogglingActive] = useState(false);

  // Reset assign form when user changes
  useEffect(() => {
    setAssignRegionId('');
    setAssignRole('member');
  }, [userId]);

  // -------------------------------------------
  // Handlers
  // -------------------------------------------

  const handleAssignRegion = async () => {
    if (!assignRegionId) {
      addToast('error', 'Please select a region');
      return;
    }
    setAssigning(true);
    const res = await api.put(`/api/admin/users/${userId}`, {
      action: 'assign_region',
      regionId: assignRegionId,
      role: assignRole,
    });
    if (res.success) {
      addToast('success', 'User assigned to region');
      setAssignRegionId('');
      setAssignRole('member');
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to assign region');
    }
    setAssigning(false);
  };

  const handleChangeRole = async (regionId: string, newRole: string) => {
    setActionLoading(regionId);
    const res = await api.put(`/api/admin/users/${userId}`, {
      action: 'change_region_role',
      regionId,
      role: newRole,
    });
    if (res.success) {
      addToast('success', 'Role updated');
      setEditingMembershipId(null);
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to change role');
    }
    setActionLoading(null);
  };

  const handleRemoveRegion = async (regionId: string, regionName: string) => {
    if (!confirm(`Remove user from ${regionName}?`)) return;
    setActionLoading(regionId);
    const res = await api.put(`/api/admin/users/${userId}`, {
      action: 'remove_region',
      regionId,
    });
    if (res.success) {
      addToast('success', `Removed from ${regionName}`);
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to remove from region');
    }
    setActionLoading(null);
  };

  const handleToggleActive = async () => {
    setTogglingActive(true);
    const res = await api.put(`/api/admin/users/${userId}`, {
      action: 'toggle_active',
    });
    if (res.success) {
      addToast('success', `User ${user?.isActive ? 'deactivated' : 'activated'}`);
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to toggle status');
    }
    setTogglingActive(false);
  };

  // -------------------------------------------
  // Render
  // -------------------------------------------

  if (loading) return <PageLoader />;

  if (error || !user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">{error || 'User not found'}</p>
        <Button variant="outline" onClick={() => router.push('/admin/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  // Regions available for assignment (exclude already-assigned ones)
  const assignedRegionIds = new Set(user.regions.map((r) => r.regionId));
  const availableRegions = (membershipInfo?.regions || []).filter(
    (r) => !assignedRegionIds.has(r.id)
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header / breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/admin/users" className="hover:text-zinc-300 transition-colors">
          Users
        </Link>
        <span>/</span>
        <span className="text-zinc-300">{user.displayName || user.username}</span>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* User Info Card                                                     */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar
            src={user.avatarUrl}
            alt={user.displayName || user.username}
            size="xl"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100">
                {user.displayName || user.username}
              </h1>
              <Badge variant={user.isActive ? 'success' : 'danger'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {user.platformRole && (
                <Badge variant="info">{formatRole(user.platformRole)}</Badge>
              )}
            </div>

            <div className="space-y-2">
              <InfoRow label="Email">
                {user.email}
                {user.emailVerified && (
                  <Badge variant="success" className="ml-2">Verified</Badge>
                )}
              </InfoRow>
              <InfoRow label="Username">@{user.username}</InfoRow>
              <InfoRow label="Level">{user.level}</InfoRow>
              <InfoRow label="XP">{user.totalXp.toLocaleString()}</InfoRow>
              <InfoRow label="Joined">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </InfoRow>
              {user.bio && <InfoRow label="Bio">{user.bio}</InfoRow>}
            </div>

            {/* Skills & Interests */}
            {(user.skills.length > 0 || user.interests.length > 0) && (
              <div className="space-y-2 pt-2">
                {user.skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-36 shrink-0 text-sm font-medium text-zinc-400">Skills</span>
                    {user.skills.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                )}
                {user.interests.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-36 shrink-0 text-sm font-medium text-zinc-400">Interests</span>
                    {user.interests.map((i) => (
                      <Badge key={i}>{i}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Active button */}
        <div className="mt-6 flex justify-end border-t border-zinc-800 pt-4">
          <Button
            variant={user.isActive ? 'danger' : 'primary'}
            size="sm"
            loading={togglingActive}
            onClick={handleToggleActive}
          >
            {user.isActive ? 'Deactivate User' : 'Activate User'}
          </Button>
        </div>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Module Leads                                                       */}
      {/* ----------------------------------------------------------------- */}
      {user.moduleLeads.length > 0 && (
        <Card>
          <CardTitle>Module Lead Assignments</CardTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.moduleLeads.map((ml) => (
              <Badge
                key={ml.module}
                variant={ml.isActive ? 'info' : 'default'}
              >
                {ml.module}
                {!ml.isActive && ' (inactive)'}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Current Region Memberships                                         */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardTitle>Region Memberships</CardTitle>

        {user.regions.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No region memberships.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {user.regions.map((region) => {
              const isEditing = editingMembershipId === region.membershipId;
              const isLoading = actionLoading === region.regionId;

              return (
                <div
                  key={region.membershipId}
                  className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Region info */}
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {region.regionName}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant={roleBadgeVariant(region.role)}>
                          {formatRole(region.role)}
                        </Badge>
                        {!region.isActive && (
                          <Badge variant="danger">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {ROLE_OPTIONS.map((ro) => (
                            <option key={ro.value} value={ro.value}>
                              {ro.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          loading={isLoading}
                          onClick={() => handleChangeRole(region.regionId, editRole)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMembershipId(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMembershipId(region.membershipId);
                            setEditRole(region.role);
                          }}
                        >
                          Change Role
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={isLoading}
                          onClick={() =>
                            handleRemoveRegion(region.regionId, region.regionName)
                          }
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Assign to Region                                                   */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <CardTitle>Assign to Region</CardTitle>

        {availableRegions.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            User is already a member of all available regions.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Region selector */}
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Region
              </label>
              <select
                value={assignRegionId}
                onChange={(e) => setAssignRegionId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a region</option>
                {availableRegions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role selector */}
            <div className="w-full sm:w-48">
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Role
              </label>
              <select
                value={assignRole}
                onChange={(e) => setAssignRole(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {ROLE_OPTIONS.map((ro) => (
                  <option key={ro.value} value={ro.value}>
                    {ro.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <Button loading={assigning} onClick={handleAssignRegion}>
              Assign
            </Button>
          </div>
        )}
      </Card>

      {/* Back link */}
      <div className="pb-4">
        <Link
          href="/admin/users"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          &larr; Back to Users
        </Link>
      </div>
    </div>
  );
}
