'use client';

import React, { use, useState } from 'react';
import { useToast } from '@/lib/context/toast-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { UserPlus, Check, X, ChevronDown, MapPin, Clock, ExternalLink } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface ApplicationItem {
  id: string;
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
  leadReviewStatus: string | null;
  leadReviewNote: string | null;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    username: string | null;
    level: number;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROLE_OPTIONS = ['member', 'co_lead', 'lead'];

const APP_STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  assigned: 'info',
  lead_reviewed: 'default',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RegionAdminMembersPage({ params }: { params: Promise<{ portalSlug: string }> }) {
  const { portalSlug } = use(params);
  const slug = portalSlug.replace(/^portal-/, '');
  const { addToast } = useToast();

  // Top-level view toggle
  const [view, setView] = useState<'members' | 'applications'>('members');

  // ---------- Members ----------
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

  // ---------- Applications ----------
  const { data: applications, loading: appsLoading, refetch: refetchApps } = useApi<ApplicationItem[]>(
    `/api/portal/regions/${slug}/admin/membership-applications`,
    { immediate: view === 'applications' },
  );
  const { mutate: patchApp, loading: reviewingApp } = useMutation<unknown>('patch');

  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Switch view
  const handleViewChange = (v: 'members' | 'applications') => {
    setView(v);
    if (v === 'applications' && !applications) {
      refetchApps();
    }
  };

  // Members handlers
  const filteredMembers = (data?.members || []).filter(m => {
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

  // Application handlers
  const handleLeadReview = async (appId: string, recommendation: 'recommend_approve' | 'recommend_reject') => {
    const res = await patchApp(`/api/portal/regions/${slug}/admin/membership-applications/${appId}`, {
      recommendation,
      note: reviewNote.trim(),
    });
    if (res.success) {
      addToast('success', recommendation === 'recommend_approve' ? 'Recommended for approval' : 'Recommended for rejection');
      setSelectedApp(null);
      setReviewNote('');
      refetchApps();
    } else {
      addToast('error', res.error?.message || 'Review failed');
    }
  };

  if (loading || !data) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Members</h1>
          <p className="text-sm text-zinc-500">
            {data.stats.totalMembers} active &middot; {data.stats.pendingMembers} pending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
            {(['members', 'applications'] as const).map((v) => (
              <button
                key={v}
                onClick={() => handleViewChange(v)}
                className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  view === v
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {view === 'members' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </button>
          )}
        </div>
      </div>

      {/* ═══════ Members View ═══════ */}
      {view === 'members' && (
        <>
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
        </>
      )}

      {/* ═══════ Applications View ═══════ */}
      {view === 'applications' && (
        <>
          {appsLoading ? (
            <PageLoader />
          ) : !applications || applications.length === 0 ? (
            <EmptyState
              title="No applications"
              description="No membership applications have been assigned to this region yet."
            />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => { setSelectedApp(app); setReviewNote(''); }}
                  className="cursor-pointer"
                >
                  <Card className="hover:border-zinc-700 transition-colors">
                    <div className="flex items-start gap-3">
                      <Avatar src={app.user.avatarUrl} alt={app.user.displayName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-zinc-200">{app.fullName}</p>
                          <span className="text-xs text-zinc-500">{app.email}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant={(APP_STATUS_BADGE[app.status] || 'default') as any}>
                            {app.status === 'assigned' ? 'Assigned' : 'Lead Reviewed'}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <MapPin className="h-3 w-3" />
                            {app.country}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {app.leadReviewStatus && (
                          <div className="mt-1">
                            <Badge variant={app.leadReviewStatus === 'recommend_approve' ? 'success' : 'danger'}>
                              {app.leadReviewStatus === 'recommend_approve' ? 'Recommended Approve' : 'Recommended Reject'}
                            </Badge>
                          </div>
                        )}
                      </div>
                      {app.status === 'assigned' && (
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); setReviewNote(''); }}>
                          Review
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* Application Detail + Review Modal */}
          <Modal
            open={!!selectedApp}
            onClose={() => setSelectedApp(null)}
            title="Application Review"
            size="xl"
          >
            {selectedApp && (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Applicant header */}
                <div className="flex items-center gap-3">
                  <Avatar src={selectedApp.user.avatarUrl} alt={selectedApp.user.displayName} size="md" />
                  <div className="flex-1">
                    <p className="font-medium text-zinc-200">{selectedApp.fullName}</p>
                    <p className="text-sm text-zinc-500">{selectedApp.email}</p>
                  </div>
                  <Badge variant={(APP_STATUS_BADGE[selectedApp.status] || 'default') as any}>
                    {selectedApp.status}
                  </Badge>
                </div>

                {/* Personal Details */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Personal Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-zinc-500">Telegram:</span>{' '}
                      <span className="text-zinc-200">{selectedApp.telegram}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">X Handle:</span>{' '}
                      <span className="text-zinc-200">{selectedApp.xHandle}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Country:</span>{' '}
                      <span className="text-zinc-200">{selectedApp.country}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">State:</span>{' '}
                      <span className="text-zinc-200">{selectedApp.state}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-500">Hours/week:</span>{' '}
                      <span className="text-zinc-200 inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {selectedApp.hoursWeekly}
                      </span>
                    </div>
                    {selectedApp.github && (
                      <div className="col-span-2">
                        <span className="text-zinc-500">GitHub:</span>{' '}
                        <a href={selectedApp.github} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 inline-flex items-center gap-1">
                          {selectedApp.github} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {selectedApp.referredBy && (
                      <div className="col-span-2">
                        <span className="text-zinc-500">Referred By:</span>{' '}
                        <span className="text-zinc-200">{selectedApp.referredBy}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience & Skills */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Experience & Skills</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-zinc-500">Bio:</span>
                      <p className="text-zinc-300 mt-1 whitespace-pre-wrap">{selectedApp.bio}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Resume/Portfolio:</span>{' '}
                      <a href={selectedApp.resumeLink} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 inline-flex items-center gap-1">
                        {selectedApp.resumeLink} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div>
                      <span className="text-zinc-500">Skills:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedApp.skills.map((skill) => (
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
                      <p className="text-zinc-300 mt-1 whitespace-pre-wrap">{selectedApp.whyJoin}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">How can they help?</span>
                      <p className="text-zinc-300 mt-1 whitespace-pre-wrap">{selectedApp.howHelp}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Expectations:</span>
                      <p className="text-zinc-300 mt-1 whitespace-pre-wrap">{selectedApp.expectations}</p>
                    </div>
                  </div>
                </div>

                {/* Already reviewed */}
                {selectedApp.leadReviewStatus && (
                  <div className={`rounded-lg border p-4 ${
                    selectedApp.leadReviewStatus === 'recommend_approve'
                      ? 'border-green-900/50 bg-green-900/10'
                      : 'border-red-900/50 bg-red-900/10'
                  }`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Your Recommendation</h4>
                    <Badge variant={selectedApp.leadReviewStatus === 'recommend_approve' ? 'success' : 'danger'}>
                      {selectedApp.leadReviewStatus === 'recommend_approve' ? 'Recommend Approve' : 'Recommend Reject'}
                    </Badge>
                    {selectedApp.leadReviewNote && (
                      <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap">{selectedApp.leadReviewNote}</p>
                    )}
                  </div>
                )}

                {/* Review Actions (only for assigned status) */}
                {selectedApp.status === 'assigned' && (
                  <div className="border-t border-zinc-800 pt-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Your Recommendation</h4>
                    <Textarea
                      label="Note (optional)"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Add context for the super admin..."
                    />
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => handleLeadReview(selectedApp.id, 'recommend_reject')}
                        loading={reviewingApp}
                        className="text-red-400"
                      >
                        Recommend Reject
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleLeadReview(selectedApp.id, 'recommend_approve')}
                        loading={reviewingApp}
                      >
                        Recommend Approve
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
