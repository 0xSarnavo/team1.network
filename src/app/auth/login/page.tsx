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
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Sign in to your account</h1>
        <p className="mb-6 text-center text-[14px] text-zinc-500 dark:text-zinc-400">Enter your email to receive a sign-in code</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-3">
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl text-sm dark:bg-[#111111] dark:border-zinc-800"
          />
          <Input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 rounded-xl text-sm dark:bg-[#111111] dark:border-zinc-800"
          />
          <Button type="submit" size="lg" className="w-full h-11 mt-1 bg-[#ff3333] hover:bg-red-600 text-black dark:text-white rounded-xl text-[15px] font-bold tracking-wide transition-colors" loading={loading}>
            Continue with Email
          </Button>
        </form>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative inline-block bg-white dark:bg-black px-4 text-xs font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            OR
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" type="button" className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-900/50 transition-colors" title="Google Demo">
            <svg className="h-[20px] w-[20px]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </Button>
          <Button variant="outline" type="button" className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-900/50 transition-colors" title="GitHub Demo">
            <svg className="h-[22px] w-[22px] text-zinc-900 dark:text-zinc-100" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
          </Button>
          <Button variant="outline" type="button" onClick={openBuilderHub} loading={bhLoading} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-900/50 transition-colors" title="Sign in with Builder Hub">
            <svg className="h-[18px] w-[18px] text-zinc-900 dark:text-zinc-100" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          By signing in, you agree to our <Link href="#" className="underline font-medium hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">Terms</Link> and <Link href="#" className="underline font-medium hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">Privacy Policy</Link>
        </p>

        <p className="mt-3 text-center text-xs text-zinc-500">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-red-500 font-medium hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
