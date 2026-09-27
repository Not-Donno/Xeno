'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, slugify } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface CategoryFormData {
  name: string;
  type: 'SPORT' | 'PRODUCT_TYPE';
  description: string;
  icon: string;
}

const EMPTY_FORM: CategoryFormData = { name: '', type: 'SPORT', description: '', icon: '' };

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [sports, setSports] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sportsRes, typesRes] = await Promise.all([
        api.get<{ categories: Category[] }>('/categories?type=SPORT', token),
        api.get<{ categories: Category[] }>('/categories?type=PRODUCT_TYPE', token),
      ]);
      setSports(sportsRes.categories || []);
      setProductTypes(typesRes.categories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAdd = (type: 'SPORT' | 'PRODUCT_TYPE') => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, type });
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      type: category.type,
      description: category.description || '',
      icon: category.icon || '',
    });
    setShowForm(true);
  };

  const saveCategory = async () => {
    if (!form.name.trim()) {
      alert('Name is required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/categories/${editing.id}`, form, token);
      } else {
        await api.post('/categories', form, token);
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setActionLoading(id);
    try {
      await api.delete(`/categories/${id}`, token);
      setSports((prev) => prev.filter((c) => c.id !== id));
      setProductTypes((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    } finally {
      setActionLoading(null);
    }
  };

  const renderSection = (title: string, items: Category[], type: 'SPORT' | 'PRODUCT_TYPE') => (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-brand-100">
        <div>
          <h3 className="text-sm font-semibold text-brand-900">{title}</h3>
          <p className="text-xs text-brand-400 mt-0.5">{items.length} categories</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => openAdd(type)}>
          + Add {type === 'SPORT' ? 'Sport' : 'Type'}
        </Button>
      </div>
      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={`No ${title.toLowerCase()} yet`}
          description="Add your first category to get started."
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/50">
              <th className="text-left px-6 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Slug</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Products</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Sort Order</th>
              <th className="text-right px-6 py-2.5 text-xs font-medium text-brand-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {items.map((cat) => (
              <tr key={cat.id} className="hover:bg-brand-50/50">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    {cat.icon && <span className="text-base">{cat.icon}</span>}
                    <span className="font-medium text-brand-950">{cat.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-500">{cat.slug}</td>
                <td className="px-4 py-3 text-brand-600">
                  {cat._count?.sportProducts ?? cat._count?.typeProducts ?? 0}
                </td>
                <td className="px-4 py-3 text-brand-600">{cat.sortOrder}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                      Edit
                    </Button>
                    {deleteConfirm === cat.id ? (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={actionLoading === cat.id}
                          onClick={() => deleteCategory(cat.id)}
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
                        onClick={() => setDeleteConfirm(cat.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-950">Categories</h2>
        <p className="text-sm text-brand-500 mt-1">Manage sports and product type categories</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {renderSection('Sports', sports, 'SPORT')}
      {renderSection('Product Types', productTypes, 'PRODUCT_TYPE')}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-brand-950 mb-4">
              {editing ? 'Edit Category' : 'Add Category'}
            </h3>
            <div className="space-y-4">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Running"
              />
              <Input
                label="Slug"
                value={form.name ? slugify(form.name) : ''}
                readOnly
                className="bg-brand-50 text-brand-500"
              />
              <Select
                label="Type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'SPORT' | 'PRODUCT_TYPE' }))}
                options={[
                  { value: 'SPORT', label: 'Sport' },
                  { value: 'PRODUCT_TYPE', label: 'Product Type' },
                ]}
                disabled={!!editing}
              />
              <Input
                label="Icon (emoji)"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="e.g. 🏃"
                maxLength={4}
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
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
              <Button variant="primary" loading={saving} onClick={saveCategory}>
                {editing ? 'Save Changes' : 'Add Category'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
