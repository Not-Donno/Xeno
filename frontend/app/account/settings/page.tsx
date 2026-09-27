'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import type { User } from '@/lib/types';

export default function SettingsPage() {
  const { token, user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatarUrl: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setProfileError('First name and last name are required');
      return;
    }

    setProfileLoading(true);
    try {
      await api.patch('/users/me', profileForm, token);
      await refreshUser();
      setProfileSuccess('Profile updated successfully');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/users/me/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, token);
      setPasswordSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-950">Account Settings</h1>

      {/* Tabs */}
      <div className="flex border-b border-brand-100">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'profile'
              ? 'border-brand-950 text-brand-950'
              : 'border-transparent text-brand-500 hover:text-brand-900'
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'password'
              ? 'border-brand-950 text-brand-950'
              : 'border-transparent text-brand-500 hover:text-brand-900'
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <div className="card p-6 max-w-lg">
          {profileError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 mb-4">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 mb-4">
              {profileSuccess}
            </div>
          )}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name *"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                required
              />
            </div>
            <Input
              label="Phone"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="Optional"
            />
            <Input
              label="Avatar URL"
              value={profileForm.avatarUrl}
              onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
            <Button type="submit" variant="primary" loading={profileLoading}>
              Save Changes
            </Button>
          </form>
        </div>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <div className="card p-6 max-w-lg">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 mb-4">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 mb-4">
              {passwordSuccess}
            </div>
          )}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password *"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
            <Input
              label="New Password *"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Minimum 6 characters"
              required
            />
            <Input
              label="Confirm New Password *"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
            <Button type="submit" variant="primary" loading={passwordLoading}>
              Change Password
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
