'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { Card, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input, Textarea, Select } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/spinner';

interface AdminStats {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalRegions: number;
    totalMembers: number;
    pendingMembers: number;
    totalEvents: number;
    totalQuests: number;
    totalGuides: number;
    pendingSubmissions: number;
  };
  recentUsers: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    createdAt: string;
  }[];
  regions: {
    id: string;
    name: string;
    slug: string;
    memberCount: number;
  }[];
}

interface Announcement {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  linkUrl: string | null;
  status: string;
  sortOrder: number;
  createdAt: string;
}

export default function AdminHubPage() {
  const { user, hasModuleLead, isSuperAdmin } = useAuth();
  const { addToast } = useToast();
  const { data, loading, error } = useApi<AdminStats>('/api/admin/stats');
  const { data: announcements, loading: annLoading, refetch: refetchAnn } = useApi<Announcement[]>('/api/home/admin/announcements');

  // Announcement form state
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annSaving, setAnnSaving] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [annForm, setAnnForm] = useState({ title: '', summary: '', content: '', linkUrl: '', status: 'published' });

  const resetAnnForm = () => {
    setAnnForm({ title: '', summary: '', content: '', linkUrl: '', status: 'published' });
    setEditingAnn(null);
    setShowAnnForm(false);
  };

  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnSaving(true);
    const payload = {
      title: annForm.title,
      summary: annForm.summary || undefined,
      content: annForm.content || undefined,
      linkUrl: annForm.linkUrl || undefined,
      status: annForm.status,
      createdBy: user?.id,
    };

    let res;
    if (editingAnn) {
      res = await api.put(`/api/home/admin/announcements?id=${editingAnn.id}`, payload);
    } else {
      res = await api.post('/api/home/admin/announcements', payload);
    }

    if (res.success) {
      addToast('success', editingAnn ? 'Announcement updated' : 'Announcement created');
      resetAnnForm();
      refetchAnn();
    } else {
      addToast('error', res.error?.message || 'Failed to save announcement');
    }
    setAnnSaving(false);
  };

  const handleAnnDelete = async (id: string) => {
    const res = await api.delete(`/api/home/admin/announcements?id=${id}`);
    if (res.success) {
      addToast('success', 'Announcement deleted');
      refetchAnn();
    } else {
      addToast('error', res.error?.message || 'Failed to delete');
    }
  };

  const startEditAnn = (a: Announcement) => {
    setEditingAnn(a);
    setAnnForm({
      title: a.title,
      summary: a.summary || '',
      content: a.content || '',
      linkUrl: a.linkUrl || '',
      status: a.status,
    });
    setShowAnnForm(true);
  };

  const modules = [
    {
      name: 'Home',
      href: '/home/admin',
      desc: 'Landing page management',
      module: 'home',
      color: 'text-blue-400',
      borderColor: 'hover:border-blue-500/50',
    },
    {
      name: 'Portal',
      href: '/portal/admin',
      desc: 'Events, quests, guides, membership',
      module: 'portal',
      color: 'text-green-400',
      borderColor: 'hover:border-green-500/50',
    },
    {
      name: 'Grants',
      href: '#',
      desc: 'Grant programs & applications',
      module: 'grants',
      color: 'text-yellow-400',
      borderColor: 'hover:border-yellow-500/50',
      soon: true,
    },
    {
      name: 'Bounty',
      href: '#',
      desc: 'Bounties & submissions',
      module: 'bounty',
      color: 'text-orange-400',
      borderColor: 'hover:border-orange-500/50',
      soon: true,
    },
    {
      name: 'Ecosystem',
      href: '#',
      desc: 'Project directory',
      module: 'ecosystem',
      color: 'text-purple-400',
      borderColor: 'hover:border-purple-500/50',
      soon: true,
    },
  ];

  const quickActions = [
    {
      name: 'Users',
      href: '/admin/users',
      desc: 'User directory & management',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
    },
    {
      name: 'Audit Log',
      href: '/admin/audit',
      desc: 'View all platform activity',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
      ),
    },
    {
      name: 'Module Leads',
      href: '/admin/leads',
      desc: 'Assign module leaders',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
    },
    {
      name: 'Super Admins',
      href: '/admin/super-admins',
      desc: 'Manage admin access',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      desc: 'Platform configuration',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-red-400">Failed to load dashboard data</p>
        <p className="text-sm text-zinc-500">{error}</p>
      </div>
    );
  }

  const stats = data?.stats;
  const recentUsers = data?.recentUsers ?? [];
  const regions = data?.regions ?? [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">
            Welcome back, {user?.displayName}
          </h1>
          <p className="mt-1 text-zinc-500">
            Super Admin Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Badge variant="danger">Super Admin</Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">
            Platform Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              }
            />
            <StatCard
              label="Active Users"
              value={stats.activeUsers.toLocaleString()}
              icon={
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              }
            />
            <StatCard
              label="Total Regions"
              value={stats.totalRegions.toLocaleString()}
              icon={
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              }
            />
            <StatCard
              label="Total Members"
              value={stats.totalMembers.toLocaleString()}
              icon={
                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              }
            />
            <StatCard
              label="Pending Members"
              value={stats.pendingMembers.toLocaleString()}
              icon={
                <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              }
            />
            <StatCard
              label="Total Events"
              value={stats.totalEvents.toLocaleString()}
              icon={
                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              }
            />
            <StatCard
              label="Active Quests"
              value={stats.totalQuests.toLocaleString()}
              icon={
                <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
              }
            />
            <StatCard
              label="Pending Submissions"
              value={stats.pendingSubmissions.toLocaleString()}
              icon={
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              }
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {isSuperAdmin && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {quickActions.map((action) => (
              <Link key={action.name} href={action.href}>
                <Card className="group h-full cursor-pointer transition-all hover:border-red-500/50 hover:bg-zinc-900/80">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500 transition-colors group-hover:bg-red-500/20">
                      {action.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{action.name}</CardTitle>
                      <p className="mt-1 text-xs text-zinc-500">{action.desc}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Announcements Management */}
      {isSuperAdmin && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-200">Announcements</h2>
            <Button
              variant={showAnnForm ? 'ghost' : 'primary'}
              size="sm"
              onClick={() => { if (showAnnForm) resetAnnForm(); else setShowAnnForm(true); }}
            >
              {showAnnForm ? 'Cancel' : 'New Announcement'}
            </Button>
          </div>

          {/* Create / Edit form */}
          {showAnnForm && (
            <Card className="mb-4">
              <CardTitle>{editingAnn ? 'Edit Announcement' : 'Create Announcement'}</CardTitle>
              <form onSubmit={handleAnnSubmit} className="mt-4 space-y-4">
                <Input
                  label="Title"
                  value={annForm.title}
                  onChange={(e) => setAnnForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Announcement title"
                  required
                />
                <Input
                  label="Summary (short description)"
                  value={annForm.summary}
                  onChange={(e) => setAnnForm((f) => ({ ...f, summary: e.target.value }))}
                  placeholder="Brief summary shown on the homepage"
                />
                <Textarea
                  label="Content (full body)"
                  value={annForm.content}
                  onChange={(e) => setAnnForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Full announcement content..."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Link URL (optional)"
                    value={annForm.linkUrl}
                    onChange={(e) => setAnnForm((f) => ({ ...f, linkUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                  <Select
                    label="Status"
                    value={annForm.status}
                    onChange={(e) => setAnnForm((f) => ({ ...f, status: e.target.value }))}
                    options={[
                      { value: 'published', label: 'Published (visible on homepage)' },
                      { value: 'draft', label: 'Draft (hidden)' },
                    ]}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" loading={annSaving}>
                    {editingAnn ? 'Update' : 'Create'}
                  </Button>
                  {editingAnn && (
                    <Button variant="ghost" type="button" onClick={resetAnnForm}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          )}

          {/* Announcements list */}
          <Card>
            {annLoading ? (
              <p className="text-sm text-zinc-500">Loading announcements...</p>
            ) : !announcements || announcements.length === 0 ? (
              <p className="text-sm text-zinc-500">No announcements yet. Create one to display on the homepage.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-800/30 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-200 truncate">{a.title}</p>
                        <Badge variant={a.status === 'published' ? 'success' : 'default'}>
                          {a.status}
                        </Badge>
                      </div>
                      {a.summary && <p className="mt-1 text-sm text-zinc-500 truncate">{a.summary}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEditAnn(a)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleAnnDelete(a.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Module Cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules
            .filter((m) => hasModuleLead(m.module))
            .map((m) => (
              <Link key={m.name} href={m.soon ? '#' : m.href}>
                <Card
                  className={`group h-full cursor-pointer transition-all ${m.borderColor} ${
                    m.soon ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 ${m.color} transition-colors group-hover:bg-zinc-700`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                          />
                        </svg>
                      </div>
                      <div>
                        <CardTitle className={m.color}>{m.name}</CardTitle>
                        <p className="mt-0.5 text-sm text-zinc-500">
                          {m.desc}
                        </p>
                      </div>
                    </div>
                    {m.soon && <Badge variant="default">Coming Soon</Badge>}
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      </div>

      {/* Bottom Grid: Regions + Recent Users */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regions Overview */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-200">
            Regions Overview
          </h2>
          <Card className="h-full">
            {regions.length === 0 ? (
              <p className="text-sm text-zinc-500">No regions found.</p>
            ) : (
              <div className="space-y-3">
                {regions.map((region) => (
                  <div
                    key={region.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/30 px-4 py-3 transition-colors hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {region.name}
                        </p>
                        <p className="text-xs text-zinc-500">/{region.slug}</p>
                      </div>
                    </div>
                    <Badge variant="info">
                      {region.memberCount.toLocaleString()} members
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Users */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-200">
              Recent Users
            </h2>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <Card className="h-full">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-zinc-500">No recent users.</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/30 px-4 py-3 transition-colors hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={u.avatarUrl}
                        alt={u.displayName}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {u.displayName}
                        </p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {formatDate(u.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
