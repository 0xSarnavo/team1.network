'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';

const steps = ['Profile', 'About', 'Socials', 'Wallet'];

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: '', bio: '', country: '', city: '',
    twitter: '', github: '', linkedin: '',
    walletAddress: '',
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleComplete = async () => {
    setLoading(true);
    // Save profile data
    await api.put('/api/profile/me', {
      displayName: form.displayName || undefined,
      bio: form.bio || undefined,
      country: form.country || undefined,
      city: form.city || undefined,
    });

    // Save socials
    if (form.twitter) await api.post('/api/profile/me/socials', { platform: 'Twitter', url: form.twitter });
    if (form.github) await api.post('/api/profile/me/socials', { platform: 'GitHub', url: form.github });
    if (form.linkedin) await api.post('/api/profile/me/socials', { platform: 'LinkedIn', url: form.linkedin });

    // Complete onboarding
    const res = await api.post('/api/profile/me/onboarding');
    if (res.success) {
      addToast('success', 'Welcome to team1!');
      await refreshUser();
      router.push('/');
    } else {
      addToast('error', res.error?.message || 'Failed to complete onboarding');
    }
    setLoading(false);
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h1 className="mb-2 text-2xl font-bold text-zinc-100">Welcome to team1!</h1>
          <p className="mb-6 text-sm text-zinc-500">Let&apos;s set up your profile. Step {step + 1} of {steps.length}</p>

          {/* Progress */}
          <div className="mb-8 flex gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1 rounded-full ${i <= step ? 'bg-red-500' : 'bg-zinc-800'}`} />
                <p className={`mt-1 text-xs ${i <= step ? 'text-red-400' : 'text-zinc-600'}`}>{s}</p>
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 0 && (
            <div className="space-y-4">
              <Input label="Display Name" value={form.displayName} onChange={(e) => update('displayName', e.target.value)} placeholder="How should we call you?" />
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-800 text-zinc-500 text-sm">
                Avatar
              </div>
              <p className="text-xs text-zinc-600">Avatar upload available in settings</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Textarea label="Bio" value={form.bio} onChange={(e) => update('bio', e.target.value)} placeholder="Tell the community about yourself..." />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Country" value={form.country} onChange={(e) => update('country', e.target.value)} />
                <Input label="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Input label="Twitter" value={form.twitter} onChange={(e) => update('twitter', e.target.value)} placeholder="https://twitter.com/..." />
              <Input label="GitHub" value={form.github} onChange={(e) => update('github', e.target.value)} placeholder="https://github.com/..." />
              <Input label="LinkedIn" value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Input label="Wallet Address (optional)" value={form.walletAddress} onChange={(e) => update('walletAddress', e.target.value)} placeholder="0x..." />
              <p className="text-xs text-zinc-500">Connect your wallet later in settings for full Web3 features.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : router.push('/')} >
              {step === 0 ? 'Skip' : 'Back'}
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Continue</Button>
            ) : (
              <Button onClick={handleComplete} loading={loading}>Complete Setup</Button>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
