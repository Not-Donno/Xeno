'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <div className="card p-8 md:p-10">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-star-white">Check your email</h1>
            <p className="text-sm text-star-blue/60 mt-3 leading-relaxed">
              If an account exists with <span className="text-accent">{email}</span>, we&apos;ve sent password reset instructions.
            </p>
            <Link href="/auth/login" className="inline-block mt-8">
              <Button variant="secondary">Back to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="card p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-star-white">Forgot password</h1>
            <p className="text-sm text-star-blue/60 mt-2">Enter your email to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Send Reset Link
            </Button>
          </form>

          <p className="text-center text-sm text-star-blue/50 mt-6">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
