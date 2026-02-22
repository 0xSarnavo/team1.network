'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      if (res.success) {
        setSent(true);
      } else {
        setError(res.error?.message || 'Failed to send reset email');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <svg className="mx-auto mb-4 h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h1 className="mb-2 text-2xl font-bold text-zinc-100">Check your email</h1>
        <p className="text-sm text-zinc-500">
          If an account exists with <span className="text-zinc-300">{email}</span>,
          we&apos;ve sent a password reset link.
        </p>
        <Link href="/auth/login">
          <Button variant="ghost" className="mt-6">Back to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
      <h1 className="mb-2 text-2xl font-bold text-zinc-100">Forgot password?</h1>
      <p className="mb-6 text-sm text-zinc-500">Enter your email and we&apos;ll send you a reset link.</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>Send Reset Link</Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-red-400 hover:text-red-300 font-medium">Sign In</Link>
      </p>
    </div>
  );
}
