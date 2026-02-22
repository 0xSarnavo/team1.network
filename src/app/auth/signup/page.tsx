'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BUILDER_HUB_LOGIN_URL = process.env.NEXT_PUBLIC_BUILDER_HUB_LOGIN_URL || 'https://build.avax.network/login';

export default function SignupPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: '', displayName: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [bhLoading, setBhLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const handleMessage = useCallback(async (event: MessageEvent) => {
    if (event.data?.type === 'builder-hub-auth' && event.data?.token) {
      setBhLoading(true);
      setError('');
      try {
        const res = await api.post<{ accessToken: string; user: { onboardingCompleted: boolean } }>(
          '/api/auth/builder-hub',
          { token: event.data.token }
        );
        if (res.success && res.data) {
          await login(res.data.accessToken);
          addToast('success', 'Account created with Builder Hub!');
          router.push(res.data.user.onboardingCompleted ? '/' : '/onboarding');
        } else {
          setError(res.error?.message || 'Builder Hub signup failed');
        }
      } catch {
        setError('Builder Hub signup failed');
      } finally {
        setBhLoading(false);
      }
    }
  }, [login, router, addToast]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const openBuilderHub = () => {
    const w = 500, h = 700;
    const left = window.screenX + (window.innerWidth - w) / 2;
    const top = window.screenY + (window.innerHeight - h) / 2;
    window.open(BUILDER_HUB_LOGIN_URL, 'builder-hub-signup', `width=${w},height=${h},left=${left},top=${top}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/signup', {
        email: form.email,
        displayName: form.displayName,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      if (res.success) {
        addToast('success', 'Account created! Check your email to verify.');
        router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`);
      } else {
        setError(res.error?.message || 'Signup failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
      <h1 className="mb-2 text-2xl font-bold text-zinc-100">Create account</h1>
      <p className="mb-6 text-sm text-zinc-500">Join the community</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button variant="secondary" size="lg" className="w-full mb-4" onClick={openBuilderHub} loading={bhLoading}>
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        Sign up with Builder Hub
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-zinc-900/50 px-3 text-zinc-500">or continue with email</span></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Display Name" value={form.displayName} onChange={(e) => update('displayName', e.target.value)} placeholder="Your name" required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 8 characters" required />
        <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Re-enter password" required />
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>Create Account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-red-400 hover:text-red-300 font-medium">Sign In</Link>
      </p>
    </div>
  );
}
