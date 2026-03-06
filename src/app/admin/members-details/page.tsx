'use client';

import React, { useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { Search, MapPin, Clock, ExternalLink, ChevronDown } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApplicationUser {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  username: string | null;
  level: number;
}

interface ApplicationRegion {
  id: string;
  name: string;
  slug: string;
}

interface MembershipApplicationItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  telegram: string;
  xHandle: string;
  country: string;
  state: string;
  bio: string;
  resumeLink: string;
  skills: string[];
  whyJoin: string;
  howHelp: string;
  expectations: string;
  hoursWeekly: number;
  github: string | null;
  referredBy: string | null;
  status: string;
  assignedRegionId: string | null;
  leadReviewStatus: string | null;
  leadReviewNote: string | null;
  leadReviewedAt: string | null;
  adminNote: string | null;
  createdAt: string;
  user: ApplicationUser;
  assignedRegion: ApplicationRegion | null;
}

interface RegionOption {
  id: string;
  name: string;
  slug: string;
}

interface MembershipInfoResponse {
  isMember: boolean;
  regions: RegionOption[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  pending: 'warning',
  assigned: 'info',
  lead_reviewed: 'default',
  approved: 'success',
  rejected: 'danger',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  lead_reviewed: 'Lead Reviewed',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'lead_reviewed', label: 'Lead Reviewed' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminMembersDetailsPage() {
  const { addToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  // Build query
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', '20');
  if (statusFilter) queryParams.set('status', statusFilter);
  if (countryFilter) queryParams.set('country', countryFilter);
  if (search) queryParams.set('search', search);

  const { data: applications, loading, refetch, pagination } = useApi<MembershipApplicationItem[]>(
    `/api/admin/membership-applications?${queryParams.toString()}`
  );

  const { data: countries } = useApi<string[]>('/api/admin/membership-applications/countries');
  const { data: regionInfo } = useApi<MembershipInfoResponse>('/api/portal/membership/info');

  // Mutations
  const { mutate: patchApplication, loading: patching } = useMutation<unknown>('patch');
  const { mutate: postBulkAssign, loading: bulkAssigning } = useMutation<unknown>('post');

  // Detail modal
  const [selected, setSelected] = useState<MembershipApplicationItem | null>(null);
  const [assignRegionId, setAssignRegionId] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Bulk assign modal
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [bulkRegionId, setBulkRegionId] = useState('');

  const regions = regionInfo?.regions || [];

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleAssign = async (appId: string) => {
    if (!assignRegionId) {
      addToast('error', 'Select a region first');
      return;
    }
    const res = await patchApplication(`/api/admin/membership-applications/${appId}`, {
      action: 'assign',
      regionId: assignRegionId,
    });
    if (res.success) {
      addToast('success', 'Application assigned to region');
      setSelected(null);
      setAssignRegionId('');
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to assign');
    }
  };

  const handleFinalDecision = async (appId: string, action: 'approve' | 'reject') => {
    const res = await patchApplication(`/api/admin/membership-applications/${appId}`, {
      action,
      note: adminNote.trim() || undefined,
    });
    if (res.success) {
      addToast('success', action === 'approve' ? 'Application approved — membership created' : 'Application rejected');
      setSelected(null);
      setAdminNote('');
      refetch();
    } else {
      addToast('error', res.error?.message || `Failed to ${action}`);
    }
  };

  const handleBulkAssign = async () => {
    if (!countryFilter || !bulkRegionId) {
      addToast('error', 'Select both a country filter and a target region');
      return;
    }
    const res = await postBulkAssign('/api/admin/membership-applications/bulk-assign', {
      country: countryFilter,
      regionId: bulkRegionId,
    });
    if (res.success) {
      addToast('success', `Bulk assigned pending applications from ${countryFilter}`);
      setShowBulkAssign(false);
      setBulkRegionId('');
      refetch();
    } else {
      addToast('error', res.error?.message || 'Bulk assign failed');
    }
  };

  if (loading && !applications) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-100">Membership Applications</h1>
        <p className="mt-1 text-zinc-500">Review, assign, and manage membership applications.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Country + Search row */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Country filter */}
          <div className="w-48">
            <label className="mb-1 block text-xs font-medium text-zinc-500">Country</label>
            <div className="relative">
              <select
                value={countryFilter}
                onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
                className="h-10 w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 pr-8 text-sm text-zinc-200"
              >
                <option value="">All Countries</option>
                {(countries || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-zinc-500">Search</label>
            <div className="flex gap-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Name or email..."
              />
              <button
                onClick={handleSearch}
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bulk Assign (only when filtering by country + pending) */}
          {countryFilter && statusFilter === 'pending' && (
            <Button
              variant="outline"
              onClick={() => setShowBulkAssign(true)}
            >
              Bulk Assign {countryFilter}
            </Button>
          )}
        </div>
      </div>

      {/* Applications List */}
      {!applications || applications.length === 0 ? (
        <EmptyState
          title="No applications found"
          description="No membership applications match your current filters."
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => { setSelected(app); setAssignRegionId(''); setAdminNote(''); }}
              className="cursor-pointer"
            >
              <Card className="hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar src={app.user.avatarUrl} alt={app.user.displayName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-zinc-200">{app.fullName}</p>
                        <span className="text-xs text-zinc-500">{app.email}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant={(STATUS_BADGE[app.status] || 'default') as any}>
                          {STATUS_LABELS[app.status] || app.status}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <MapPin className="h-3 w-3" />
                          {app.country}, {app.state}
                        </span>
                        {app.assignedRegion && (
                          <span className="text-xs text-zinc-400">
                            Region: {app.assignedRegion.name}
                          </span>
                        )}
                        <span className="text-xs text-zinc-600">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {app.leadReviewStatus && (
                        <div className="mt-1">
                          <Badge variant={app.leadReviewStatus === 'recommend_approve' ? 'success' : 'danger'}>
                            {app.leadReviewStatus === 'recommend_approve' ? 'Lead: Approve' : 'Lead: Reject'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-zinc-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Application Detail"
        size="xl"
      >
        {selected && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Applicant header */}
            <div className="flex items-center gap-3">
              <Avatar src={selected.user.avatarUrl} alt={selected.user.displayName} size="md" />
              <div className="flex-1">
                <p className="font-medium text-zinc-200">{selected.fullName}</p>
                <p className="text-sm text-zinc-500">{selected.email}</p>
              </div>
              <Badge variant={(STATUS_BADGE[selected.status] || 'default') as any}>
                {STATUS_LABELS[selected.status] || selected.status}
              </Badge>
            </div>

            {/* Personal Details */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Personal Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-zinc-500">Telegram:</span>{' '}
                  <span className="text-zinc-200">{selected.telegram}</span>
                </div>
                <div>
                  <span className="text-zinc-500">X Handle:</span>{' '}
                  <span className="text-zinc-200">{selected.xHandle}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Country:</span>{' '}
                  <span className="text-zinc-200">{selected.country}</span>
                </div>
                <div>
                  <span className="text-zinc-500">State:</span>{' '}
                  <span className="text-zinc-200">{selected.state}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-zinc-500">Hours/week:</span>{' '}
                  <span className="text-zinc-200 flex items-center gap-1 inline-flex">
                    <Clock className="h-3 w-3" /> {selected.hoursWeekly}
                  </span>
                </div>
                {selected.github && (
                  <div className="col-span-2">
                    <span className="text-zinc-500">GitHub:</span>{' '}
                    <a href={selected.github} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 inline-flex items-center gap-1">
                      {selected.github} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {selected.referredBy && (
                  <div className="col-span-2">
                    <span className="text-zinc-500">Referred By:</span>{' '}
                    <span className="text-zinc-200">{selected.referredBy}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resume + Skills */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Experience & Skills</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-zinc-500">Bio:</span>
                  <p className="text-zinc-300 mt-1 whitespace-pre-wrap">{selected.bio}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Resume/Portfolio:</span>{' '}
                  <a href={selected.resumeLink} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 inline-flex items-center gap-1">
                    {selected.resumeLink} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div>
                  <span className="text-zinc-500">Skills:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selected.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Community Fit */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Community Fit</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-zinc-500">Why join?</span>
                  <p className="text-zinc-300 mt-1 whitespace-pre-wrap">{selected.whyJoin}</p>
                </div>
                <div>
                  <span className="text-zinc-500">How can they help?</span>
                  <p className="text-zinc-300 mt-1 whitespace-pre-wrap">{selected.howHelp}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Expectations:</span>
                  <p className="text-zinc-300 mt-1 whitespace-pre-wrap">{selected.expectations}</p>
                </div>
              </div>
            </div>

            {/* Lead Review Info */}
            {selected.leadReviewStatus && (
              <div className={`rounded-lg border p-4 ${
                selected.leadReviewStatus === 'recommend_approve'
                  ? 'border-green-900/50 bg-green-900/10'
                  : 'border-red-900/50 bg-red-900/10'
              }`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Lead Recommendation</h4>
                <Badge variant={selected.leadReviewStatus === 'recommend_approve' ? 'success' : 'danger'}>
                  {selected.leadReviewStatus === 'recommend_approve' ? 'Recommend Approve' : 'Recommend Reject'}
                </Badge>
                {selected.leadReviewNote && (
                  <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap">{selected.leadReviewNote}</p>
                )}
                {selected.leadReviewedAt && (
                  <p className="mt-1 text-xs text-zinc-600">
                    Reviewed: {new Date(selected.leadReviewedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Assigned Region */}
            {selected.assignedRegion && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                <span className="text-xs text-zinc-500">Assigned to:</span>{' '}
                <span className="text-sm font-medium text-zinc-200">{selected.assignedRegion.name}</span>
              </div>
            )}

            {/* Actions */}
            {selected.status === 'pending' && (
              <div className="border-t border-zinc-800 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Assign to Region</h4>
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <select
                      value={assignRegionId}
                      onChange={(e) => setAssignRegionId(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 pr-8 text-sm text-zinc-200"
                    >
                      <option value="">Select region...</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleAssign(selected.id)}
                    loading={patching}
                    disabled={!assignRegionId}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            )}

            {selected.status === 'lead_reviewed' && (
              <div className="border-t border-zinc-800 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Final Decision</h4>
                <Textarea
                  label="Admin Note (optional)"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note..."
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => handleFinalDecision(selected.id, 'reject')}
                    loading={patching}
                    className="text-red-400"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleFinalDecision(selected.id, 'approve')}
                    loading={patching}
                  >
                    Approve & Create Membership
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Bulk Assign Modal */}
      <Modal
        open={showBulkAssign}
        onClose={() => setShowBulkAssign(false)}
        title={`Bulk Assign — ${countryFilter}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Assign all <b className="text-zinc-200">pending</b> applications from <b className="text-zinc-200">{countryFilter}</b> to a region.
          </p>
          <div className="relative">
            <select
              value={bulkRegionId}
              onChange={(e) => setBulkRegionId(e.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 pr-8 text-sm text-zinc-200"
            >
              <option value="">Select target region...</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowBulkAssign(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleBulkAssign}
              loading={bulkAssigning}
              disabled={!bulkRegionId}
            >
              Bulk Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
