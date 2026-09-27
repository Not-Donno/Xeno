'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-950">Welcome back</h1>
          <p className="text-sm text-brand-500 mt-1">Sign in to your Xeno account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
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
            <Link href="/auth/forgot-password" className="text-sm text-brand-500 hover:text-brand-950">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-brand-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-brand-950 font-medium hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-8 p-4 bg-brand-50 rounded-lg">
          <p className="text-xs font-medium text-brand-700 mb-2">Demo Accounts:</p>
          <div className="space-y-1 text-xs text-brand-600">
            <p>Admin: admin@xeno.com / Admin123!</p>
            <p>Vendor: velocity@xeno.com / Vendor123!</p>
            <p>Customer: john@example.com / Customer123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
