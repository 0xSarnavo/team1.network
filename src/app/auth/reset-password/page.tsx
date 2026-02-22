'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { useToast } from '@/lib/context/toast-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { addToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-zinc-100">Invalid Link</h1>
        <p className="text-sm text-zinc-500">This password reset link is invalid or expired.</p>
        <Link href="/auth/forgot-password">
          <Button variant="primary" className="mt-6">Request New Link</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/reset-password', { token, newPassword: password, confirmPassword });
      if (res.success) {
        addToast('success', 'Password reset successfully!');
        router.push('/auth/login');
      } else {
        setError(res.error?.message || 'Reset failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
      <h1 className="mb-2 text-2xl font-bold text-zinc-100">Reset password</h1>
      <p className="mb-6 text-sm text-zinc-500">Enter your new password below.</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required />
        <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>Reset Password</Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner size="lg" className="mx-auto mt-12" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
