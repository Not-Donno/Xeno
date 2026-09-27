'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Address } from '@/lib/types';

const emptyForm = {
  label: '',
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  isDefault: false,
};

export default function AddressesPage() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get<{ addresses: Address[] }>('/users/me/addresses', token);
      setAddresses(res.addresses || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.label || !form.name || !form.phone || !form.line1 || !form.city || !form.state || !form.postalCode) {
      setFormError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/users/me/addresses/${editingId}`, form, token);
      } else {
        await api.post('/users/me/addresses', form, token);
      }
      await fetchAddresses();
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr: Address) => {
    setForm({
      label: addr.label,
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/users/me/addresses/${id}`, token);
      await fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/users/me/addresses/${id}`, { isDefault: true }, token);
      await fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to set default address');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-brand-950">My Addresses</h1>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-950">My Addresses</h1>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>Add Address</Button>
        )}
      </div>

      {error && (
        <EmptyState
          title="Error loading addresses"
          description={error}
          action={{ label: 'Retry', onClick: fetchAddresses }}
        />
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-brand-950 mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 mb-4">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Label *"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Home, Work, etc."
                required
              />
              <Input
                label="Full Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Phone *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <Input
                label="Address Line 1 *"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                required
              />
            </div>
            <Input
              label="Address Line 2"
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
              placeholder="Apt, Suite, etc. (optional)"
            />
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="City *"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
              <Input
                label="State *"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />
              <Input
                label="Postal Code *"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <Input
                label="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-32"
              />
              <label className="flex items-center gap-2 text-sm text-brand-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="rounded border-brand-300"
                />
                Set as default
              </label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={saving}>
                {editingId ? 'Update Address' : 'Add Address'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {!error && addresses.length === 0 && !showForm ? (
        <div className="card p-8">
          <EmptyState
            title="No addresses saved"
            description="Add a shipping address for faster checkout."
            action={{ label: 'Add Address', onClick: () => setShowForm(true) }}
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-brand-900">{addr.label}</h3>
                  {addr.isDefault && <Badge variant="info">Default</Badge>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="text-xs text-brand-500 hover:text-brand-950"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-brand-600 space-y-1">
                <p className="font-medium text-brand-900">{addr.name}</p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                <p>{addr.country}</p>
                <p className="text-brand-500">{addr.phone}</p>
              </div>
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="mt-3 text-xs text-brand-600 hover:text-brand-950 underline"
                >
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
