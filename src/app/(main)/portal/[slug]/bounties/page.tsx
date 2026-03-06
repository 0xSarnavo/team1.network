'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

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

interface RegionInfo {
  region: { id: string; name: string; slug: string };
}

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

const TYPE_LABELS: Record<string, string> = {
  one_time: 'One-time',
  recurring_weekly: 'Weekly',
  recurring_monthly: 'Monthly',
};

export default function RegionBountiesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToast } = useToast();

  const { data: regionInfo } = useApi<RegionInfo>(`/api/portal/regions/${slug}/manage`);
  const regionId = regionInfo?.region?.id;

  const { data: bounties, loading, refetch } = useApi<BountyItem[]>(
    regionId ? `/api/bounty/admin?regionId=${regionId}` : '',
    { immediate: !!regionId }
  );

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'content', xpReward: '50',
    type: 'one_time', maxSubmissions: '', startsAt: '', endsAt: '', proofRequirements: '',
  });
  const { mutate: createBounty, loading: creating } = useMutation('post');

  const [editBounty, setEditBounty] = useState<BountyItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '', description: '', category: 'content', xpReward: '50',
    type: 'one_time', status: 'draft', maxSubmissions: '', startsAt: '', endsAt: '', proofRequirements: '',
  });
  const { mutate: updateBounty, loading: updating } = useMutation('put');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { mutate: deleteBounty, loading: deleting } = useMutation('delete');

  const handleCreate = async () => {
    if (!form.title || !form.description || !regionId) {
      addToast('error', 'Title and description are required'); return;
    }
    const res = await createBounty('/api/bounty/admin', {
      title: form.title, description: form.description, category: form.category,
      xpReward: parseInt(form.xpReward) || 50, type: form.type, regionId,
      maxSubmissions: form.maxSubmissions ? parseInt(form.maxSubmissions) : null,
      startsAt: form.startsAt || null, endsAt: form.endsAt || null,
      proofRequirements: form.proofRequirements || null,
    });
    if (res.success) {
      addToast('success', 'Bounty created'); setShowCreate(false);
      setForm({ title: '', description: '', category: 'content', xpReward: '50', type: 'one_time', maxSubmissions: '', startsAt: '', endsAt: '', proofRequirements: '' });
      refetch();
    } else addToast('error', res.error?.message || 'Failed to create bounty');
  };

  const openEdit = (b: BountyItem) => {
    setEditBounty(b);
    setEditForm({
      title: b.title, description: b.description, category: b.category,
      xpReward: String(b.xpReward), type: b.type, status: b.status,
      maxSubmissions: b.maxSubmissions ? String(b.maxSubmissions) : '',
      startsAt: b.startsAt ? b.startsAt.split('T')[0] : '',
      endsAt: b.endsAt ? b.endsAt.split('T')[0] : '',
      proofRequirements: b.proofRequirements || '',
    });
  };

  const handleUpdate = async () => {
    if (!editBounty) return;
    const res = await updateBounty(`/api/bounty/admin/${editBounty.id}`, {
      title: editForm.title, description: editForm.description, category: editForm.category,
      xpReward: parseInt(editForm.xpReward) || 50, type: editForm.type, status: editForm.status,
      maxSubmissions: editForm.maxSubmissions ? parseInt(editForm.maxSubmissions) : null,
      startsAt: editForm.startsAt || null, endsAt: editForm.endsAt || null,
      proofRequirements: editForm.proofRequirements || null,
    });
    if (res.success) { addToast('success', 'Bounty updated'); setEditBounty(null); refetch(); }
    else addToast('error', res.error?.message || 'Failed to update bounty');
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await deleteBounty(`/api/bounty/admin/${deletingId}`);
    if (res.success) { addToast('success', 'Bounty archived'); setDeletingId(null); refetch(); }
    else addToast('error', res.error?.message || 'Failed to archive bounty');
  };

  if (loading || !regionInfo) return <PageLoader />;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-8 pt-24">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/portal/${slug}/manage`} className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Bounty Management</h1>
            <p className="mt-1 text-sm text-zinc-500">Create and manage bounties for {regionInfo.region.name}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/portal/${slug}/bounties/submissions`}>
              <button className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-bold text-zinc-600 transition-all hover:bg-zinc-900 hover:text-white hover:border-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-white dark:hover:text-zinc-900 dark:hover:border-white active:scale-95">
                Review Submissions
              </button>
            </Link>
            <Link href={`/portal/${slug}/bounties/reviewers`}>
              <button className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-bold text-zinc-600 transition-all hover:bg-zinc-900 hover:text-white hover:border-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-white dark:hover:text-zinc-900 dark:hover:border-white active:scale-95">
                Manage Reviewers
              </button>
            </Link>
            <button onClick={() => setShowCreate(true)} className="rounded-full bg-zinc-900 px-5 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90 dark:bg-white dark:text-zinc-900 active:scale-95">
              Create Bounty
            </button>
          </div>
        </div>
      </div>

      {/* Bounty list */}
      {!bounties || bounties.length === 0 ? (
        <EmptyState title="No bounties yet" description="Create your first bounty for this region." action={{ label: 'Create Bounty', onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="space-y-2">
          {bounties.map((b) => (
            <div key={b.id} className="rounded-2xl border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <span className={b.status === 'active' ? 'text-emerald-500/70' : b.status === 'archived' ? 'text-rose-500/70' : ''}>{b.status}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span>{b.category}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span>{TYPE_LABELS[b.type] || b.type}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span className="text-[#FF394A]">+{b.xpReward} XP</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{b.title}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{b.description}</p>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-zinc-400">
                    <span>{b.submissionCount} submissions</span>
                    {b.maxSubmissions && <span>Max: {b.maxSubmissions}</span>}
                    {b.endsAt && <span>Ends: {new Date(b.endsAt).toLocaleDateString()}</span>}
                    <span>Created: {new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(b)} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Edit</button>
                  {b.status !== 'archived' && (
                    <button onClick={() => setDeletingId(b.id)} className="text-[10px] font-bold text-[#FF394A]/70 hover:text-[#FF394A]">Archive</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Bounty" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Write a getting started guide" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what needs to be done..." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORY_OPTIONS} />
            <Input label="XP Reward" type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={TYPE_OPTIONS} />
            <Input label="Max Submissions (optional)" type="number" value={form.maxSubmissions} onChange={(e) => setForm({ ...form, maxSubmissions: e.target.value })} placeholder="Leave empty for unlimited" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date (optional)" type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            <Input label="End Date (optional)" type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
          </div>
          <Textarea label="Proof Requirements (optional)" value={form.proofRequirements} onChange={(e) => setForm({ ...form, proofRequirements: e.target.value })} placeholder="Describe what proof is needed..." />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Cancel</button>
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
            <Input label="Max Submissions" type="number" value={editForm.maxSubmissions} onChange={(e) => setEditForm({ ...editForm, maxSubmissions: e.target.value })} placeholder="Leave empty for unlimited" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={editForm.startsAt} onChange={(e) => setEditForm({ ...editForm, startsAt: e.target.value })} />
            <Input label="End Date" type="date" value={editForm.endsAt} onChange={(e) => setEditForm({ ...editForm, endsAt: e.target.value })} />
          </div>
          <Textarea label="Proof Requirements" value={editForm.proofRequirements} onChange={(e) => setEditForm({ ...editForm, proofRequirements: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditBounty(null)} className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Cancel</button>
            <Button loading={updating} onClick={handleUpdate}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={handleDelete} title="Archive Bounty?" message="This bounty will be archived and hidden from public view. Existing submissions will be preserved." confirmLabel="Archive" confirmVariant="danger" loading={deleting} />
    </div>
  );
}
