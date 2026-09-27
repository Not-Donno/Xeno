'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { Vendor } from '@/lib/types';

function Toggle({ enabled, onChange, label, description }: { enabled: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-brand-900">{label}</p>
        <p className="text-xs text-brand-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          enabled ? 'bg-brand-950' : 'bg-brand-200'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

export default function VendorSettingsPage() {
  const { token } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  // Store settings
  const [storeSettings, setStoreSettings] = useState({
    name: '',
    description: '',
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    newReviews: true,
    lowStockAlerts: true,
    weeklyReports: false,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ vendor: Vendor }>('/vendors/me/profile', token);
      setVendor(res.vendor);
      setStoreSettings({
        name: res.vendor.name || '',
        description: res.vendor.description || '',
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSuccess('');
    setSettingsError('');
    try {
      await api.patch(
        '/vendors/me/profile',
        {
          name: storeSettings.name.trim(),
          description: storeSettings.description.trim(),
        },
        token
      );
      setSettingsSuccess('Store settings saved successfully');
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const errors: Record<string, string> = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (passwordForm.confirmPassword !== passwordForm.newPassword) errors.confirmPassword = 'Passwords do not match';

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPasswordSaving(true);
    try {
      await api.post(
        '/users/me/change-password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        token
      );
      setPasswordSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    // Persist locally as a placeholder until a dedicated endpoint exists
    setTimeout(() => setNotifSaving(false), 500);
  };

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Settings</h1>
        <p className="text-sm text-brand-500 mt-1">Manage your store preferences and account security</p>
      </div>

      {/* Store Settings */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-brand-950 mb-4">Store Settings</h2>

        {settingsSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
            {settingsSuccess}
          </div>
        )}
        {settingsError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {settingsError}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <Input
            label="Store Name"
            value={storeSettings.name}
            onChange={(e) => {
              setStoreSettings((prev) => ({ ...prev, name: e.target.value }));
              setSettingsSuccess('');
            }}
            required
          />
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Store Description</label>
            <textarea
              value={storeSettings.description}
              onChange={(e) => {
                setStoreSettings((prev) => ({ ...prev, description: e.target.value }));
                setSettingsSuccess('');
              }}
              rows={3}
              className="input"
              placeholder="Describe your store..."
            />
          </div>
          <Button type="submit" variant="primary" loading={settingsSaving}>
            Save Store Settings
          </Button>
        </form>
      </div>

      {/* Password Change */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-brand-950 mb-1">Change Password</h2>
        <p className="text-xs text-brand-500 mb-4">Keep your account secure with a strong password</p>

        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
            {passwordSuccess}
          </div>
        )}
        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => {
              setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));
              setPasswordSuccess('');
              setPasswordError('');
            }}
            error={passwordErrors.currentPassword}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => {
              setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
              setPasswordSuccess('');
              setPasswordError('');
            }}
            error={passwordErrors.newPassword}
            placeholder="Minimum 8 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => {
              setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
              setPasswordSuccess('');
              setPasswordError('');
            }}
            error={passwordErrors.confirmPassword}
            required
          />
          <Button type="submit" variant="primary" loading={passwordSaving}>
            Change Password
          </Button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-brand-950 mb-1">Notification Preferences</h2>
        <p className="text-xs text-brand-500 mb-4">Choose what updates you want to receive</p>

        <div className="divide-y divide-brand-100">
          <Toggle
            enabled={notifications.orderUpdates}
            onChange={(v) => setNotifications((prev) => ({ ...prev, orderUpdates: v }))}
            label="Order Updates"
            description="Get notified when orders are placed or their status changes"
          />
          <Toggle
            enabled={notifications.newReviews}
            onChange={(v) => setNotifications((prev) => ({ ...prev, newReviews: v }))}
            label="New Reviews"
            description="Get notified when customers leave reviews"
          />
          <Toggle
            enabled={notifications.lowStockAlerts}
            onChange={(v) => setNotifications((prev) => ({ ...prev, lowStockAlerts: v }))}
            label="Low Stock Alerts"
            description="Get notified when products are running low on stock"
          />
          <Toggle
            enabled={notifications.weeklyReports}
            onChange={(v) => setNotifications((prev) => ({ ...prev, weeklyReports: v }))}
            label="Weekly Reports"
            description="Receive a weekly summary of your store performance"
          />
        </div>

        <div className="mt-4 pt-4 border-t border-brand-100">
          <Button variant="secondary" size="sm" loading={notifSaving} onClick={handleSaveNotifications}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
