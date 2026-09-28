'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="card p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-star-white">Welcome back</h1>
            <p className="text-sm text-star-blue/60 mt-2">Sign in to your Xeno account</p>
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

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />

            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-star-blue/60 hover:text-accent transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-star-blue/50 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-accent font-medium hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-8 p-4 bg-surface-light/50 rounded-xl border border-surface-border/50">
            <p className="text-xs font-medium text-star-blue/70 mb-3 uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-2 text-xs text-star-blue/60">
              <p><span className="text-accent">Admin:</span> admin@xeno.com / Admin123!</p>
              <p><span className="text-accent">Vendor:</span> velocity@xeno.com / Vendor123!</p>
              <p><span className="text-accent">Customer:</span> john@example.com / Customer123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
