'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { useApi } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';

interface ProfileData {
  displayName: string;
  bio: string | null;
  title: string | null;
  avatarUrl: string | null;
  country: string | null;
  city: string | null;
}

export default function GeneralSettingsPage() {
  const { refreshUser } = useAuth();
  const { addToast } = useToast();
  const { data: profile, loading } = useApi<ProfileData>('/api/profile/me');
  const [form, setForm] = useState({ displayName: '', bio: '', title: '', country: '', city: '' });
  const [saving, setSaving] = useState(false);

  // Skills/Interests/Roles
  const { data: skills, refetch: refetchSkills } = useApi<{ id: string; name: string }[]>('/api/profile/me/skills');
  const { data: interests, refetch: refetchInterests } = useApi<{ id: string; name: string }[]>('/api/profile/me/interests');
  const { data: roles, refetch: refetchRoles } = useApi<{ id: string; name: string }[]>('/api/profile/me/roles');
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        title: profile.title || '',
        country: profile.country || '',
        city: profile.city || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const res = await api.put('/api/profile/me', form);
    if (res.success) {
      addToast('success', 'Profile updated');
      refreshUser();
    } else {
      addToast('error', res.error?.message || 'Failed to update');
    }
    setSaving(false);
  };

  const addItem = async (type: 'skills' | 'interests' | 'roles', value: string, setter: (v: string) => void, refetch: () => void) => {
    if (!value.trim()) return;
    const res = await api.post(`/api/profile/me/${type}`, { name: value.trim() });
    if (res.success) { setter(''); refetch(); }
    else addToast('error', res.error?.message || 'Failed to add');
  };

  const removeItem = async (type: 'skills' | 'interests' | 'roles', id: string, refetch: () => void) => {
    await api.delete(`/api/profile/me/${type}/${id}`);
    refetch();
  };

  if (loading) return <PageLoader />;

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Profile Information</CardTitle>
        <div className="mt-4 space-y-4">
          <Input label="Display Name" value={form.displayName} onChange={(e) => update('displayName', e.target.value)} />
          <Input label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Full Stack Developer" />
          <Textarea label="Bio" value={form.bio} onChange={(e) => update('bio', e.target.value)} placeholder="Tell us about yourself..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Country" value={form.country} onChange={(e) => update('country', e.target.value)} />
            <Input label="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
          </div>
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <CardTitle>Skills</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {(skills || []).map((s) => (
            <Badge key={s.id} variant="default">
              {s.name}
              <button onClick={() => removeItem('skills', s.id, () => refetchSkills())} className="ml-1 text-zinc-500 hover:text-red-400">&times;</button>
            </Badge>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add skill..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && addItem('skills', newSkill, setNewSkill, () => refetchSkills())} />
          <Button size="sm" onClick={() => addItem('skills', newSkill, setNewSkill, () => refetchSkills())}>Add</Button>
        </div>
      </Card>

      {/* Interests */}
      <Card>
        <CardTitle>Interests</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {(interests || []).map((i) => (
            <Badge key={i.id} variant="info">
              {i.name}
              <button onClick={() => removeItem('interests', i.id, () => refetchInterests())} className="ml-1 text-zinc-500 hover:text-red-400">&times;</button>
            </Badge>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="Add interest..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && addItem('interests', newInterest, setNewInterest, () => refetchInterests())} />
          <Button size="sm" onClick={() => addItem('interests', newInterest, setNewInterest, () => refetchInterests())}>Add</Button>
        </div>
      </Card>

      {/* Roles */}
      <Card>
        <CardTitle>Roles</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {(roles || []).map((r) => (
            <Badge key={r.id} variant="success">
              {r.name}
              <button onClick={() => removeItem('roles', r.id, () => refetchRoles())} className="ml-1 text-zinc-500 hover:text-red-400">&times;</button>
            </Badge>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Add role..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && addItem('roles', newRole, setNewRole, () => refetchRoles())} />
          <Button size="sm" onClick={() => addItem('roles', newRole, setNewRole, () => refetchRoles())}>Add</Button>
        </div>
      </Card>
    </div>
  );
}
