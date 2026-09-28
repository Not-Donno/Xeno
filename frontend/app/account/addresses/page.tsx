'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Address } from '@/lib/types';

export default function AddressesPage() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: '', name: '', phone: '', line1: '', line2: '',
    city: '', state: '', postalCode: '', country: '', isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const res = await api.get<{ addresses: Address[] }>('/users/me/addresses', token);
      setAddresses(res.addresses || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, [token]);

  const resetForm = () => {
    setForm({ label: '', name: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', isDefault: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (addr: Address) => {
    setForm({
      label: addr.label, name: addr.name, phone: addr.phone,
      line1: addr.line1, line2: addr.line2 || '', city: addr.city,
      state: addr.state, postalCode: addr.postalCode, country: addr.country,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/users/me/addresses/${editingId}`, form, token);
      } else {
        await api.post('/users/me/addresses', form, token);
      }
      await fetchAddresses();
      resetForm();
    } catch (err: any) {
      alert(err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this address?')) return;
    try {
      await api.delete(`/users/me/addresses/${id}`, token);
      await fetchAddresses();
    } catch (err: any) { alert(err.message); }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-surface-lighter rounded animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse space-y-3">
              <div className="h-4 bg-surface-lighter rounded w-1/3" />
              <div className="h-3 bg-surface-lighter rounded w-2/3" />
              <div className="h-3 bg-surface-lighter rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-star-white">My Addresses</h1>
        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true); }}>
          Add Address
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 md:p-8 animate-scale-in">
          <h2 className="text-lg font-semibold text-star-white mb-6">
            {editingId ? 'Edit Address' : 'New Address'}
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required placeholder="Home, Work..." />
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input label="Address Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
            <Input label="Address Line 2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
            <Input label="Postal Code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} required />
            <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
          </div>
          <label className="flex items-center gap-2.5 mt-5 text-sm text-star-blue cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="rounded border-surface-border accent-accent"
            />
            Set as default address
          </label>
          <div className="flex gap-3 mt-6">
            <Button type="submit" variant="primary" loading={saving}>
              {editingId ? 'Update' : 'Save'}
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <EmptyState
          title="No addresses saved"
          description="Add a shipping address for faster checkout."
          action={{ label: 'Add Address', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {addresses.map((addr, i) => (
            <div
              key={addr.id}
              className="card card-hover p-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-star-white">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="badge bg-accent/10 text-accent text-[10px]">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-star-blue/70 mt-2">{addr.name}</p>
                  <p className="text-sm text-star-blue/50 mt-1">
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                    {addr.city}, {addr.state} {addr.postalCode}<br />
                    {addr.country}
                  </p>
                  <p className="text-xs text-star-blue/40 mt-2">{addr.phone}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="p-2 text-star-blue/40 hover:text-accent rounded-lg hover:bg-accent/10 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-star-blue/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
