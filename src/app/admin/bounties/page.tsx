'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/context/toast-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StatCard } from '@/components/ui/stat-card';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BountyItem {
  id: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  type: string;
  regionId: string | null;
  status: string;
  maxSubmissions: number | null;
  startsAt: string | null;
  endsAt: string | null;
  proofRequirements: string | null;
  submissionCount: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS = [
  { value: 'content', label: 'Content' },
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'community', label: 'Community' },
  { value: 'translation', label: 'Translation' },
  { value: 'security', label: 'Security' },
];

const TYPE_OPTIONS = [
  { value: 'one_time', label: 'One-time' },
  { value: 'recurring_weekly', label: 'Recurring Weekly' },
  { value: 'recurring_monthly', label: 'Recurring Monthly' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  draft: 'default',
  active: 'success',
  completed: 'info',
  archived: 'danger',
};

const TYPE_LABELS: Record<string, string> = {
  one_time: 'One-time',
  recurring_weekly: 'Weekly',
  recurring_monthly: 'Monthly',
};

const FILTER_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...STATUS_OPTIONS,
];

const FILTER_CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  ...CATEGORY_OPTIONS,
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminBountiesPage() {
  const { addToast } = useToast();

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const queryParams = new URLSearchParams();
  queryParams.set('limit', '50');
  if (filterStatus) queryParams.set('status', filterStatus);
  if (filterCategory) queryParams.set('category', filterCategory);

  const { data: bounties, loading, refetch } = useApi<BountyItem[]>(
    `/api/admin/bounties?${queryParams.toString()}`
  );

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'content', xpReward: '50',
    type: 'one_time', status: 'draft', maxSubmissions: '',
    startsAt: '', endsAt: '', proofRequirements: '',
  });
  const { mutate: createBounty, loading: creating } = useMutation('post');

  // Edit modal
  const [editBounty, setEditBounty] = useState<BountyItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '', description: '', category: 'content', xpReward: '50',
    type: 'one_time', status: 'draft', maxSubmissions: '',
    startsAt: '', endsAt: '', proofRequirements: '',
  });
  const { mutate: updateBounty, loading: updating } = useMutation('put');

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { mutate: deleteBounty, loading: deleting } = useMutation('delete');

  const handleCreate = async () => {
    if (!form.title || !form.description) {
      addToast('error', 'Title and description are required');
      return;
    }
    const res = await createBounty('/api/admin/bounties', {
      title: form.title,
      description: form.description,
      category: form.category,
      xpReward: parseInt(form.xpReward) || 50,
      type: form.type,
      status: form.status,
      regionId: null,
      maxSubmissions: form.maxSubmissions ? parseInt(form.maxSubmissions) : null,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      proofRequirements: form.proofRequirements || null,
    });
    if (res.success) {
      addToast('success', 'Bounty created');
      setShowCreate(false);
      setForm({ title: '', description: '', category: 'content', xpReward: '50', type: 'one_time', status: 'draft', maxSubmissions: '', startsAt: '', endsAt: '', proofRequirements: '' });
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to create bounty');
    }
  };

  const openEdit = (b: BountyItem) => {
    setEditBounty(b);
    setEditForm({
      title: b.title,
      description: b.description,
      category: b.category,
      xpReward: String(b.xpReward),
      type: b.type,
      status: b.status,
      maxSubmissions: b.maxSubmissions ? String(b.maxSubmissions) : '',
      startsAt: b.startsAt ? b.startsAt.split('T')[0] : '',
      endsAt: b.endsAt ? b.endsAt.split('T')[0] : '',
      proofRequirements: b.proofRequirements || '',
    });
  };

  const handleUpdate = async () => {
    if (!editBounty) return;
    const res = await updateBounty(`/api/admin/bounties/${editBounty.id}`, {
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      xpReward: parseInt(editForm.xpReward) || 50,
      type: editForm.type,
      status: editForm.status,
      maxSubmissions: editForm.maxSubmissions ? parseInt(editForm.maxSubmissions) : null,
      startsAt: editForm.startsAt || null,
      endsAt: editForm.endsAt || null,
      proofRequirements: editForm.proofRequirements || null,
    });
    if (res.success) {
      addToast('success', 'Bounty updated');
      setEditBounty(null);
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to update bounty');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await deleteBounty(`/api/admin/bounties/${deletingId}`);
    if (res.success) {
      addToast('success', 'Bounty archived');
      setDeletingId(null);
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to archive bounty');
    }
  };

  // Stats
  const totalBounties = bounties?.length || 0;
  const activeBounties = bounties?.filter(b => b.status === 'active').length || 0;
  const totalSubmissions = bounties?.reduce((sum, b) => sum + b.submissionCount, 0) || 0;

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Bounty Management</h1>
          <p className="mt-1 text-zinc-500">Create and manage global bounties across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/bounties/submissions">
            <Button variant="outline">Review Submissions</Button>
          </Link>
          <Button onClick={() => setShowCreate(true)}>Create Bounty</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Bounties" value={totalBounties} />
        <StatCard label="Active Bounties" value={activeBounties} />
        <StatCard label="Total Submissions" value={totalSubmissions} />
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={FILTER_STATUS_OPTIONS}
          className="max-w-[160px]"
        />
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          options={FILTER_CATEGORY_OPTIONS}
          className="max-w-[160px]"
        />
      </div>

      {/* Bounty List */}
      {!bounties || bounties.length === 0 ? (
        <EmptyState
          title="No bounties found"
          description="Create your first global bounty to get started."
          action={{ label: 'Create Bounty', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="space-y-3">
          {bounties.map((b) => (
            <Card key={b.id} className="hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant={STATUS_BADGE[b.status] || 'default'}>{b.status}</Badge>
                    <Badge variant="default">{b.category}</Badge>
                    <Badge variant="default">{TYPE_LABELS[b.type] || b.type}</Badge>
                    <span className="text-xs font-medium text-green-400">+{b.xpReward} XP</span>
                    {b.regionId ? (
                      <Badge variant="info">Regional</Badge>
                    ) : (
                      <Badge variant="warning">Global</Badge>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-zinc-100 truncate">{b.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-1 mt-0.5">{b.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-600">
                    <span>{b.submissionCount} submissions</span>
                    {b.maxSubmissions && <span>Max: {b.maxSubmissions}</span>}
                    {b.endsAt && <span>Ends: {new Date(b.endsAt).toLocaleDateString()}</span>}
                    <span>Created: {new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>Edit</Button>
                  {b.status !== 'archived' && (
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={() => setDeletingId(b.id)}>Archive</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Global Bounty" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Write a getting started guide" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what needs to be done..." />
          <div className="grid grid-cols-3 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORY_OPTIONS} />
            <Input label="XP Reward" type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={TYPE_OPTIONS} />
            <Input label="Max Submissions (optional)" type="number" value={form.maxSubmissions} onChange={(e) => setForm({ ...form, maxSubmissions: e.target.value })} placeholder="Unlimited" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date (optional)" type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            <Input label="End Date (optional)" type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
          </div>
          <Textarea label="Proof Requirements (optional)" value={form.proofRequirements} onChange={(e) => setForm({ ...form, proofRequirements: e.target.value })} placeholder="Describe what proof is needed..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button loading={creating} onClick={handleCreate}>Create Bounty</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editBounty} onClose={() => setEditBounty(null)} title="Edit Bounty" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <Textarea label="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Select label="Category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} options={CATEGORY_OPTIONS} />
            <Input label="XP Reward" type="number" value={editForm.xpReward} onChange={(e) => setEditForm({ ...editForm, xpReward: e.target.value })} />
            <Select label="Status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} options={STATUS_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} options={TYPE_OPTIONS} />
            <Input label="Max Submissions" type="number" value={editForm.maxSubmissions} onChange={(e) => setEditForm({ ...editForm, maxSubmissions: e.target.value })} placeholder="Unlimited" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={editForm.startsAt} onChange={(e) => setEditForm({ ...editForm, startsAt: e.target.value })} />
            <Input label="End Date" type="date" value={editForm.endsAt} onChange={(e) => setEditForm({ ...editForm, endsAt: e.target.value })} />
          </div>
          <Textarea label="Proof Requirements" value={editForm.proofRequirements} onChange={(e) => setEditForm({ ...editForm, proofRequirements: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditBounty(null)}>Cancel</Button>
            <Button loading={updating} onClick={handleUpdate}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Archive Confirm */}
      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Archive Bounty?"
        message="This bounty will be archived and hidden from public view. Existing submissions will be preserved."
        confirmLabel="Archive"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
}
