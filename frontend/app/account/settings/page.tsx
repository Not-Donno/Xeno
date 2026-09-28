'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage('');
    try {
      await api.patch('/users/me', profile, token);
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.newPassword !== password.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (password.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await api.post('/users/me/change-password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      }, token);
      setMessage('Password changed successfully!');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-star-white">Account Settings</h1>

      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        {(['profile', 'security'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px capitalize transition-all duration-300 ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-star-blue/50 hover:text-star-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm animate-fade-in ${
            message.includes('success')
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="card p-6 md:p-8 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-star-white mb-6">Profile Information</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <Input
              label="First Name"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
            <Input
              label="Avatar URL"
              value={profile.avatarUrl}
              onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="card p-6 md:p-8 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-star-white mb-6">Change Password</h2>
          <div className="space-y-5 max-w-md">
            <Input
              label="Current Password"
              type="password"
              value={password.currentPassword}
              onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={password.newPassword}
              onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
              required
              placeholder="Min 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={password.confirmPassword}
              onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
              required
            />
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" loading={saving}>
              Change Password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
