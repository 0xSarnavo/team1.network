'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/lib/context/toast-context';
import { useApi, useMutation } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';

interface GuideItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  coverImageUrl: string | null;
  readTime: number | null;
  status: string;
  authorId: string;
  createdAt: string;
}

interface RegionInfo {
  region: { id: string; name: string; slug: string };
}

const CATEGORY_OPTIONS = [
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'playbook', label: 'Playbook' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'best-practices', label: 'Best Practices' },
  { value: 'faq', label: 'FAQ' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

function toSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function RegionGuidesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToast } = useToast();

  const { data: regionInfo } = useApi<RegionInfo>(`/api/portal/regions/${slug}/manage`);

  const { data: guides, loading, refetch } = useApi<GuideItem[]>(
    '/api/portal/admin/guides',
    { immediate: true }
  );

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '', category: 'getting-started', content: '', status: 'draft',
    coverImageUrl: '', readTime: '',
  });
  const { mutate: createGuide, loading: creating } = useMutation('post');

  const handleCreate = async () => {
    if (!form.title || !form.content) {
      addToast('error', 'Title and content are required');
      return;
    }
    const guideSlug = toSlug(form.title) + '-' + Date.now().toString(36);
    const res = await createGuide('/api/portal/admin/guides', {
      title: form.title, slug: guideSlug, category: form.category, content: form.content,
      status: form.status, coverImageUrl: form.coverImageUrl || undefined,
      readTime: form.readTime ? parseInt(form.readTime) : undefined,
    });
    if (res.success) {
      addToast('success', 'Guide created');
      setShowCreate(false);
      setForm({ title: '', category: 'getting-started', content: '', status: 'draft', coverImageUrl: '', readTime: '' });
      refetch();
    } else {
      addToast('error', res.error?.message || 'Failed to create guide');
    }
  };

  if (loading || !regionInfo) return <PageLoader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500">Create and manage guides and playbooks for {regionInfo.region.name}.</p>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-2 text-xs font-bold text-white transition-all hover:opacity-90 dark:bg-white dark:text-zinc-900 active:scale-95">
          Create Guide
        </button>
      </div>

      {!guides || guides.length === 0 ? (
        <EmptyState
          title="No guides yet"
          description="Create your first guide or playbook."
          action={{ label: 'Create Guide', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="space-y-2">
          {guides.map((g) => (
            <div key={g.id} className="rounded-2xl border border-zinc-200/60 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800/60 dark:hover:border-zinc-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <span className={g.status === 'published' ? 'text-emerald-500/70' : ''}>{g.status}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                    <span>{g.category}</span>
                    {g.readTime && (
                      <>
                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                        <span>{g.readTime} min read</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{g.title}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{g.content}</p>
                  <span className="text-[10px] text-zinc-400 mt-1 block">Created: {new Date(g.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Guide" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Getting Started with Web3" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORY_OPTIONS} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
          </div>
          <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Guide content (markdown supported)..." rows={8} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cover Image URL (optional)" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://..." />
            <Input label="Read Time (minutes, optional)" type="number" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Cancel</button>
            <Button loading={creating} onClick={handleCreate}>Create Guide</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
