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

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [bhLoading, setBhLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(user.onboardingCompleted ? '/' : '/onboarding');
    }
  }, [user, router]);

  // Listen for Builder Hub popup message
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
          addToast('success', 'Signed in with Builder Hub!');
          router.push(res.data.user.onboardingCompleted ? '/' : '/onboarding');
        } else {
          setError(res.error?.message || 'Builder Hub login failed');
        }
      } catch {
        setError('Builder Hub login failed');
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
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    window.open(
      BUILDER_HUB_LOGIN_URL,
      'builder-hub-login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ accessToken: string; user: { onboardingCompleted: boolean } }>(
        '/api/auth/login',
        { email, password }
      );
      if (res.success && res.data) {
        await login(res.data.accessToken);
        addToast('success', 'Signed in!');
        router.push(res.data.user.onboardingCompleted ? '/' : '/onboarding');
      } else {
        setError(res.error?.message || 'Login failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
      <h1 className="mb-2 text-2xl font-bold text-zinc-100">Welcome back</h1>
      <p className="mb-6 text-sm text-zinc-500">Sign in to your account</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Builder Hub Login */}
      <Button
        variant="secondary"
        size="lg"
        className="w-full mb-4"
        onClick={openBuilderHub}
        loading={bhLoading}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        Sign in with Builder Hub
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-zinc-900/50 px-3 text-zinc-500">or continue with email</span>
        </div>
      </div>

      {/* Email Login */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-xs text-red-400 hover:text-red-300">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-red-400 hover:text-red-300 font-medium">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
