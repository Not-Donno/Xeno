'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Rating } from '@/components/ui/Rating';
import { formatDate } from '@/lib/utils';
import type { Vendor } from '@/lib/types';

export default function VendorProfilePage() {
  const { token } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ vendor: Vendor }>('/vendors/me/profile', token);
      const v = res.vendor;
      setVendor(v);
      setForm({
        name: v.name || '',
        description: v.description || '',
        logoUrl: v.logoUrl || '',
        bannerUrl: v.bannerUrl || '',
        website: v.socialLinks?.website || '',
        instagram: v.socialLinks?.instagram || '',
        twitter: v.socialLinks?.twitter || '',
        facebook: v.socialLinks?.facebook || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.patch(
        '/vendors/me/profile',
        {
          name: form.name.trim(),
          description: form.description.trim(),
          logoUrl: form.logoUrl.trim() || null,
          bannerUrl: form.bannerUrl.trim() || null,
          socialLinks: {
            website: form.website.trim() || null,
            instagram: form.instagram.trim() || null,
            twitter: form.twitter.trim() || null,
            facebook: form.facebook.trim() || null,
          },
        },
        token
      );
      setSuccess('Profile updated successfully');
      await fetchProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error && !vendor) {
    return (
      <div className="card p-8 text-center animate-fade-in">
        <p className="text-red-400 mb-4">{error}</p>
        <Button variant="accent" onClick={fetchProfile}>Retry</Button>
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-star-white">Store Profile</h1>
        <p className="text-sm text-star-blue/50 mt-1">Customize how your store appears to customers</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 animate-fade-in">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 animate-fade-in">{error}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Edit Form */}
        <div className="card p-6 space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-base font-semibold text-star-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-accent/15 flex items-center justify-center text-accent-light text-xs font-bold">1</span>
            Store Information
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Store Name"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
            />

            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              placeholder="Tell customers about your store..."
            />

            <Input
              label="Logo URL"
              value={form.logoUrl}
              onChange={(e) => setField('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
            />

            <Input
              label="Banner URL"
              value={form.bannerUrl}
              onChange={(e) => setField('bannerUrl', e.target.value)}
              placeholder="https://example.com/banner.png"
            />

            <div className="pt-2">
              <h3 className="text-sm font-semibold text-star-white mb-3">Social Links</h3>
              <div className="space-y-3">
                <Input
                  label="Website"
                  value={form.website}
                  onChange={(e) => setField('website', e.target.value)}
                  placeholder="https://yourstore.com"
                />
                <Input
                  label="Instagram"
                  value={form.instagram}
                  onChange={(e) => setField('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourstore"
                />
                <Input
                  label="Twitter"
                  value={form.twitter}
                  onChange={(e) => setField('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourstore"
                />
                <Input
                  label="Facebook"
                  value={form.facebook}
                  onChange={(e) => setField('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourstore"
                />
              </div>
            </div>

            <Button type="submit" variant="accent" loading={saving} className="w-full">
              Save Changes
            </Button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="p-5 border-b border-surface-border/50">
            <h2 className="text-base font-semibold text-star-white">Store Preview</h2>
            <p className="text-xs text-star-blue/40 mt-0.5">How your store appears to customers</p>
          </div>

          {/* Banner */}
          <div className="h-36 bg-gradient-to-br from-surface-lighter to-surface-light relative overflow-hidden">
            {form.bannerUrl ? (
              <Image
                src={form.bannerUrl}
                alt="Store banner"
                fill
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-10 h-10 text-star-blue/20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-star-blue/30 mt-1">No banner image</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-space-950/60 to-transparent" />
          </div>

          {/* Store info */}
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-cosmic-500/20 overflow-hidden shrink-0 flex items-center justify-center border-2 border-accent/30 shadow-glow">
                {form.logoUrl ? (
                  <Image
                    src={form.logoUrl}
                    alt={form.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-accent-light">
                    {form.name?.[0] || 'S'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-star-white">{form.name || 'Store Name'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Rating value={vendor.rating} size="sm" />
                  <span className="text-xs text-star-blue/40">
                    {vendor.rating.toFixed(1)} ({vendor._count?.reviews || 0} reviews)
                  </span>
                </div>
                <p className="text-xs text-star-blue/40 mt-1">
                  {vendor._count?.products || 0} products &middot; Joined {formatDate(vendor.createdAt)}
                </p>
              </div>
            </div>

            {form.description && (
              <p className="text-sm text-star-blue/60 mt-4 line-clamp-3">{form.description}</p>
            )}

            {/* Social links preview */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-surface-border/30">
              {form.website && (
                <span className="p-2 rounded-lg bg-accent/10 text-accent-light border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer" title="Website">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </span>
              )}
              {form.instagram && (
                <span className="p-2 rounded-lg bg-cosmic-500/10 text-cosmic-400 border border-cosmic-500/20 hover:bg-cosmic-500/20 transition-colors cursor-pointer" title="Instagram">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </span>
              )}
              {form.twitter && (
                <span className="p-2 rounded-lg bg-accent/10 text-accent-light border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer" title="Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </span>
              )}
              {form.facebook && (
                <span className="p-2 rounded-lg bg-accent/10 text-accent-light border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer" title="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </span>
              )}
              {!form.website && !form.instagram && !form.twitter && !form.facebook && (
                <p className="text-xs text-star-blue/30">No social links added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
