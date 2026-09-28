'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Promotion } from '@/lib/types';

interface PromotionFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

const EMPTY_FORM: PromotionFormData = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  isActive: true,
};

export default function AdminPromotionsPage() {
  const { token } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState<PromotionFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ promotions: Promotion[] }>('/promotions', token);
      setPromotions(res.promotions || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (promo: Promotion) => {
    setEditing(promo);
    setForm({
      title: promo.title,
      subtitle: promo.subtitle || '',
      imageUrl: promo.imageUrl || '',
      linkUrl: promo.linkUrl || '',
      isActive: promo.isActive,
    });
    setShowForm(true);
  };

  const savePromotion = async () => {
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/promotions/${editing.id}`, form, token);
      } else {
        await api.post('/promotions', form, token);
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      fetchPromotions();
    } catch (err: any) {
      alert(err.message || 'Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (promo: Promotion) => {
    setActionLoading(promo.id);
    try {
      await api.patch(`/promotions/${promo.id}`, { isActive: !promo.isActive }, token);
      setPromotions((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update promotion');
    } finally {
      setActionLoading(null);
    }
  };

  const deletePromotion = async (id: string) => {
    setActionLoading(id);
    try {
      await api.delete(`/promotions/${id}`, token);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete promotion');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-xl font-bold text-star-white">Promotions</h2>
          <p className="text-sm text-star-blue/60 mt-1">{promotions.length} promotions</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          + Add Promotion
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg animate-fade-in-up">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <Skeleton className="h-32 rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <EmptyState
          title="No promotions yet"
          description="Create promotional banners for your store homepage."
          action={{ label: 'Add Promotion', onClick: openAdd }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo, i) => (
            <div
              key={promo.id}
              className="card card-hover overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="h-32 bg-surface-lighter relative">
                {promo.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={promo.imageUrl}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={promo.isActive ? 'success' : 'default'}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-star-white">{promo.title}</h3>
                {promo.subtitle && (
                  <p className="text-sm text-star-blue/60 mt-1">{promo.subtitle}</p>
                )}
                {promo.linkUrl && (
                  <p className="text-xs text-star-blue/40 mt-2 truncate">{promo.linkUrl}</p>
                )}
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={actionLoading === promo.id}
                    onClick={() => toggleActive(promo)}
                  >
                    {promo.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(promo)}>
                    Edit
                  </Button>
                  {deleteConfirm === promo.id ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={actionLoading === promo.id}
                        onClick={() => deletePromotion(promo.id)}
                      >
                        Confirm
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(promo.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-surface-border rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-star-white mb-4">
              {editing ? 'Edit Promotion' : 'Add Promotion'}
            </h3>
            <div className="space-y-4">
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Summer Sale"
              />
              <Input
                label="Subtitle"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="e.g. Up to 50% off"
              />
              <Input
                label="Image URL"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
              <Input
                label="Link URL"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="https://..."
              />
              <label className="flex items-center gap-2 text-sm text-star-blue/80">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-surface-border bg-surface-light text-accent focus:ring-accent"
                />
                Active
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setForm(EMPTY_FORM);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" loading={saving} onClick={savePromotion}>
                {editing ? 'Save Changes' : 'Add Promotion'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
