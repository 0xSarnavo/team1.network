'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      setStatus('verifying');
      api.post('/api/auth/verify-email', { token }).then((res) => {
        if (res.success) {
          setStatus('success');
          setMessage('Your email has been verified! You can now sign in.');
        } else {
          setStatus('error');
          setMessage(res.error?.message || 'Verification failed');
        }
      }).catch(() => {
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      });
    }
  }, [token]);

  if (!token) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <svg className="mx-auto mb-4 h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h1 className="mb-2 text-2xl font-bold text-zinc-100">Check your email</h1>
        <p className="text-sm text-zinc-500">
          We sent a verification link to{' '}
          {email ? <span className="font-medium text-zinc-300">{email}</span> : 'your email'}.
          Click the link to verify your account.
        </p>
        <Link href="/auth/login">
          <Button variant="ghost" className="mt-6">Back to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
      {status === 'verifying' && (
        <>
          <Spinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-bold text-zinc-100">Verifying your email...</h1>
        </>
      )}
      {status === 'success' && (
        <>
          <svg className="mx-auto mb-4 h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="mb-2 text-2xl font-bold text-zinc-100">Email Verified!</h1>
          <p className="text-sm text-zinc-500">{message}</p>
          <Link href="/auth/login">
            <Button variant="primary" className="mt-6">Sign In</Button>
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <svg className="mx-auto mb-4 h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="mb-2 text-2xl font-bold text-zinc-100">Verification Failed</h1>
          <p className="text-sm text-zinc-500">{message}</p>
          <Link href="/auth/login">
            <Button variant="ghost" className="mt-6">Back to Sign In</Button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Spinner size="lg" className="mx-auto mt-12" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
