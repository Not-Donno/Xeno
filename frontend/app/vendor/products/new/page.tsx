'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { Brand, Category } from '@/lib/types';

interface VariantRow {
  color: string;
  size: string;
  sku: string;
  stock: string;
}

interface ImageRow {
  url: string;
}

const EMPTY_VARIANT: VariantRow = { color: '', size: '', sku: '', stock: '' };
const EMPTY_IMAGE: ImageRow = { url: '' };

export default function NewProductPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [sports, setSports] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<Category[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    discountPrice: '',
    sku: '',
    brandId: '',
    sportCategoryId: '',
    productTypeId: '',
    tags: '',
  });
  const [variants, setVariants] = useState<VariantRow[]>([{ ...EMPTY_VARIANT }]);
  const [images, setImages] = useState<ImageRow[]>([{ ...EMPTY_IMAGE }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<{ brands: Brand[] }>('/brands'),
      api.get<{ categories: Category[] }>('/categories?type=SPORT'),
      api.get<{ categories: Category[] }>('/categories?type=PRODUCT_TYPE'),
    ])
      .then(([brandsRes, sportsRes, typesRes]) => {
        setBrands(brandsRes.brands);
        setSports(sportsRes.categories);
        setProductTypes(typesRes.categories);
      })
      .catch(() => {})
      .finally(() => setLoadingMeta(false));
  }, []);

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Variant handlers
  const updateVariant = (index: number, field: keyof VariantRow, value: string) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, { ...EMPTY_VARIANT }]);

  const removeVariant = (index: number) => {
    setVariants((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  // Image handlers
  const updateImage = (index: number, value: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { url: value } : img)));
  };

  const addImage = () => setImages((prev) => [...prev, { ...EMPTY_IMAGE }]);

  const removeImage = (index: number) => {
    setImages((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Product name is required';
    if (!form.description.trim()) next.description = 'Description is required';
    if (form.description.trim().length > 0 && form.description.trim().length < 20)
      next.description = 'Description must be at least 20 characters';
    if (!form.price || parseFloat(form.price) <= 0) next.price = 'Valid price is required';
    if (form.discountPrice && parseFloat(form.discountPrice) >= parseFloat(form.price || '0'))
      next.discountPrice = 'Discount price must be less than price';
    if (!form.sku.trim()) next.sku = 'SKU is required';
    if (!form.brandId) next.brandId = 'Brand is required';

    const filledVariants = variants.filter((v) => v.color || v.size || v.sku || v.stock);
    if (filledVariants.length > 0) {
      filledVariants.forEach((v, i) => {
        if (!v.color.trim()) next[`variant_${i}_color`] = 'Color is required';
        if (!v.size.trim()) next[`variant_${i}_size`] = 'Size is required';
        if (!v.sku.trim()) next[`variant_${i}_sku`] = 'SKU is required';
        if (v.stock === '' || parseInt(v.stock) < 0) next[`variant_${i}_stock`] = 'Valid stock is required';
      });
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const filledVariants = variants
        .filter((v) => v.color.trim() || v.size.trim() || v.sku.trim() || v.stock !== '')
        .map((v) => ({
          color: v.color.trim(),
          size: v.size.trim(),
          sku: v.sku.trim(),
          stock: parseInt(v.stock) || 0,
        }));

      const imageUrls = images.map((img) => img.url.trim()).filter(Boolean);

      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        sku: form.sku.trim(),
        brandId: form.brandId,
        sportCategoryId: form.sportCategoryId || undefined,
        productTypeId: form.productTypeId || undefined,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        variants: filledVariants.length > 0 ? filledVariants : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      await api.post('/products/vendor/me', body, token);
      router.push('/vendor/products');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMeta) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="card p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">Create New Product</h1>
        <p className="text-sm text-brand-500 mt-1">Fill in the details to add a new product to your store</p>
      </div>

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-brand-950">Basic Information</h2>

          <Input
            label="Product Name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            error={errors.name}
            placeholder="e.g. Velocity Running Shoes"
            required
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Short Description"
              value={form.shortDescription}
              onChange={(e) => setField('shortDescription', e.target.value)}
              placeholder="Brief product summary (max 200 chars)"
              maxLength={200}
            />
            <Input
              label="SKU"
              value={form.sku}
              onChange={(e) => setField('sku', e.target.value)}
              error={errors.sku}
              placeholder="e.g. VEL-RUN-001"
              required
            />
          </div>

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            error={errors.description}
            placeholder="Detailed product description (min 20 characters)"
            rows={4}
            required
          />

          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setField('tags', e.target.value)}
              placeholder="running, shoes, lightweight (comma separated)"
              className="input"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-brand-950">Pricing</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              error={errors.price}
              placeholder="99.99"
              required
            />
            <Input
              label="Discount Price"
              type="number"
              step="0.01"
              min="0"
              value={form.discountPrice}
              onChange={(e) => setField('discountPrice', e.target.value)}
              error={errors.discountPrice}
              placeholder="79.99 (optional)"
            />
          </div>
        </div>

        {/* Categorization */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-brand-950">Categorization</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Select
              label="Brand"
              value={form.brandId}
              onChange={(e) => setField('brandId', e.target.value)}
              error={errors.brandId}
              options={[
                { value: '', label: 'Select brand...' },
                ...brands.map((b) => ({ value: b.id, label: b.name })),
              ]}
              required
            />
            <Select
              label="Sport Category"
              value={form.sportCategoryId}
              onChange={(e) => setField('sportCategoryId', e.target.value)}
              options={[
                { value: '', label: 'Select sport...' },
                ...sports.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
            <Select
              label="Product Type"
              value={form.productTypeId}
              onChange={(e) => setField('productTypeId', e.target.value)}
              options={[
                { value: '', label: 'Select type...' },
                ...productTypes.map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
          </div>
        </div>

        {/* Variants */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-brand-950">Variants</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addVariant}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Variant
            </Button>
          </div>
          <p className="text-xs text-brand-500">Add color and size combinations for this product</p>

          <div className="space-y-3">
            {variants.map((variant, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 bg-brand-50/50 rounded-md border border-brand-100">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Color"
                      value={variant.color}
                      onChange={(e) => updateVariant(i, 'color', e.target.value)}
                      className={cn('input text-sm', errors[`variant_${i}_color`] && 'border-red-500')}
                    />
                    {errors[`variant_${i}_color`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`variant_${i}_color`]}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Size"
                      value={variant.size}
                      onChange={(e) => updateVariant(i, 'size', e.target.value)}
                      className={cn('input text-sm', errors[`variant_${i}_size`] && 'border-red-500')}
                    />
                    {errors[`variant_${i}_size`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`variant_${i}_size`]}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                      className={cn('input text-sm', errors[`variant_${i}_sku`] && 'border-red-500')}
                    />
                    {errors[`variant_${i}_sku`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`variant_${i}_sku`]}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Stock"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                      className={cn('input text-sm', errors[`variant_${i}_stock`] && 'border-red-500')}
                    />
                    {errors[`variant_${i}_stock`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`variant_${i}_stock`]}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  disabled={variants.length === 1}
                  className="self-start sm:self-center p-2 text-brand-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-brand-950">Images</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addImage}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Image
            </Button>
          </div>
          <p className="text-xs text-brand-500">Add image URLs. The first image will be the primary image.</p>

          <div className="space-y-2">
            {images.map((image, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder={`Image URL ${i + 1}${i === 0 ? ' (primary)' : ''}`}
                  value={image.url}
                  onChange={(e) => updateImage(i, e.target.value)}
                  className="input text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  disabled={images.length === 1}
                  className="p-2 text-brand-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="lg" loading={submitting}>
            Create Product
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
