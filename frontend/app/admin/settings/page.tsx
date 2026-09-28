'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

interface Setting {
  key: string;
  value: string;
  description?: string;
}

const SETTING_META: Record<
  string,
  { label: string; description: string; prefix?: string; suffix?: string; step?: string }
> = {
  shipping_threshold: {
    label: 'Free Shipping Threshold',
    description: 'Orders above this amount qualify for free shipping',
    prefix: '$',
    step: '0.01',
  },
  shipping_fee: {
    label: 'Standard Shipping Fee',
    description: 'Flat shipping fee for orders below the free shipping threshold',
    prefix: '$',
    step: '0.01',
  },
  tax_rate: {
    label: 'Tax Rate',
    description: 'Percentage applied to all orders',
    suffix: '%',
    step: '0.01',
  },
};

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Setting[]>('/admin/settings', token);
      const map: Record<string, string> = {};
      const list = Array.isArray(res) ? res : (res as any).settings || [];
      list.forEach((s: Setting) => {
        map[s.key] = s.value;
      });
      setSettings(map);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSetting = async (key: string, value: string) => {
    setSavingKey(key);
    setSaveSuccess(null);
    try {
      await api.patch(`/admin/settings/${key}`, { value }, token);
      setSettings((prev) => ({ ...prev, [key]: value }));
      setSaveSuccess(key);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save setting');
    } finally {
      setSavingKey(null);
    }
  };

  const settingKeys = Object.keys(SETTING_META);

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-bold text-star-white">Settings</h2>
        <p className="text-sm text-star-blue/60 mt-1">Platform-wide configuration</p>
      </div>

      {error && (
        <EmptyState
          title="Failed to load settings"
          description={error}
          action={{ label: 'Retry', onClick: fetchSettings }}
        />
      )}

      {loading ? (
        <div className="card p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {settingKeys.map((key) => (
            <div key={key} className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-6 space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {settingKeys.map((key, i) => {
            const meta = SETTING_META[key];
            const value = settings[key] ?? '';
            return (
              <div key={key} className="animate-fade-in-up" style={{ animationDelay: `${150 + i * 80}ms` }}>
                <label className="block text-sm font-medium text-star-white mb-1">
                  {meta.label}
                </label>
                <p className="text-xs text-star-blue/40 mb-2">{meta.description}</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    {meta.prefix && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-star-blue/40">
                        {meta.prefix}
                      </span>
                    )}
                    <input
                      type="number"
                      value={value}
                      step={meta.step || '1'}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className={`input ${meta.prefix ? 'pl-7' : ''} ${meta.suffix ? 'pr-10' : ''}`}
                    />
                    {meta.suffix && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-star-blue/40">
                        {meta.suffix}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    loading={savingKey === key}
                    onClick={() => saveSetting(key, value)}
                    disabled={!value}
                  >
                    Save
                  </Button>
                  {saveSuccess === key && (
                    <span className="flex items-center text-xs text-emerald-400 font-medium animate-fade-in">
                      Saved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
