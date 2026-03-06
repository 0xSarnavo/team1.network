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
    <div className="w-full overflow-hidden rounded-[24px] bg-white shadow-2xl dark:bg-black border border-zinc-200 dark:border-zinc-800">
      {/* Top Graphic Panel */}
      <div className="relative flex h-[220px] w-full items-center justify-center bg-[#0a0a0a] overflow-hidden">
        {/* User image placing */}
        <img 
          src="/image.png" 
          alt="Authentication Banner" 
          className="relative z-0 h-full w-full object-contain p-6" 
        />
        
        {/* Close Button mapped to Home */}
        <Link href="/" className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 bg-white/10 dark:bg-black/20 backdrop-blur-sm transition-colors hover:bg-white/30 dark:hover:bg-black/40 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white z-10">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      {/* Bottom Form Panel */}
      <div className="px-8 pb-8 pt-6">
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Create account</h1>
        <p className="mb-6 text-center text-[14px] text-zinc-500 dark:text-zinc-400">Join the community</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <Button variant="secondary" size="lg" className="w-full mb-4 h-11 rounded-xl text-[14px] dark:bg-transparent dark:border-zinc-800 dark:hover:bg-zinc-900/50" onClick={openBuilderHub} loading={bhLoading}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Sign up with Builder Hub
        </Button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200 dark:border-zinc-800" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-zinc-500 dark:bg-black">or continue with email</span></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Display Name" value={form.displayName} onChange={(e) => update('displayName', e.target.value)} placeholder="Your name" required className="h-11 rounded-xl text-sm dark:bg-[#111111] dark:border-zinc-800" />
        <Input label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required className="h-11 rounded-xl text-sm dark:bg-[#111111] dark:border-zinc-800" />
        <Input label="Password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 8 characters" required className="h-11 rounded-xl text-sm dark:bg-[#111111] dark:border-zinc-800" />
        <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Re-enter password" required className="h-11 rounded-xl text-sm dark:bg-[#111111] dark:border-zinc-800" />
        <Button type="submit" size="lg" className="w-full h-11 mt-1 bg-[#ff3333] hover:bg-red-600 text-black dark:text-white rounded-xl text-[15px] font-bold tracking-wide transition-colors" loading={loading}>Create Account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-red-400 hover:text-red-300 font-medium">Sign In</Link>
      </p>
      </div>
    </div>
  );
}
