'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product, Review } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { token } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  useEffect(() => {
    setLoading(true);
    api
      .get<{ product: Product }>(`/products/${slug}`)
      .then((res) => {
        setProduct(res.product);
        if (res.product.variants?.length) {
          setSelectedColor(res.product.variants[0].color);
          setSelectedSize(res.product.variants[0].size);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    api
      .get<{ products: Product[] }>(`/products/${slug}/related`)
      .then((res) => setRelated(res.products))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    api
      .get<{ reviews: Review[] }>(`/reviews/product/${product.id}`)
      .then((res) => setReviews(res.reviews))
      .catch(() => {});
  }, [product]);

  const selectedVariant = product?.variants?.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const inWishlist = product ? isInWishlist(product.id) : false;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAddingToCart(true);
    try {
      await addItem(selectedVariant.id, quantity);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    setAddingToCart(true);
    try {
      await addItem(selectedVariant.id, quantity);
      window.location.href = '/checkout';
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container-x py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-950">Product not found</h1>
        <p className="text-brand-500 mt-2">The product you are looking for does not exist.</p>
        <Link href="/products" className="inline-block mt-4">
          <Button variant="primary">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const colors = [...new Set(product.variants?.map((v) => v.color) || [])];
  const sizes = [...new Set(product.variants?.map((v) => v.size) || [])];
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;

  return (
    <div className="container-x py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-500 mb-6">
        <Link href="/" className="hover:text-brand-950">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand-950">Products</Link>
        <span>/</span>
        <span className="text-brand-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square bg-brand-50 rounded-lg overflow-hidden mb-3">
            {product.images?.[selectedImage] ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt || product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {product.discountPrice && (
              <span className="absolute top-3 left-3 badge bg-accent text-brand-950 font-bold">
                SALE
              </span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    'relative w-20 h-20 rounded-md overflow-hidden border-2 shrink-0',
                    selectedImage === idx ? 'border-brand-950' : 'border-transparent'
                  )}
                >
                  <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <Link
            href={`/vendors/${product.vendor.slug}`}
            className="text-sm text-brand-500 hover:text-brand-950 uppercase tracking-wide"
          >
            {product.vendor.name}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-950 mt-1">{product.name}</h1>

          <div className="flex items-center gap-3 mt-2">
            <Rating value={product.rating} size="md" showValue />
            <span className="text-sm text-brand-500">({product.reviewCount} reviews)</span>
          </div>

          <div className="mt-4">
            <Price price={product.price} discountPrice={product.discountPrice} size="lg" />
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-brand-600">{product.shortDescription}</p>
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="mt-6">
              <label className="text-sm font-medium text-brand-900">Color: {selectedColor}</label>
              <div className="flex gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'px-4 py-2 text-sm border rounded-md transition-colors',
                      selectedColor === color
                        ? 'border-brand-950 bg-brand-950 text-white'
                        : 'border-brand-200 hover:border-brand-400'
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium text-brand-900">Size: {selectedSize}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'px-4 py-2 text-sm border rounded-md transition-colors min-w-[48px]',
                      selectedSize === size
                        ? 'border-brand-950 bg-brand-950 text-white'
                        : 'border-brand-200 hover:border-brand-400'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mt-4">
            {inStock ? (
              <span className="text-sm text-green-600 font-medium">In Stock</span>
            ) : (
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            )}
            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
              <span className="text-sm text-orange-600 ml-2">Only {selectedVariant.stock} left!</span>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-4">
            <label className="text-sm font-medium text-brand-900">Quantity</label>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 border border-brand-200 rounded-md flex items-center justify-center hover:bg-brand-50"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 99, q + 1))}
                className="w-10 h-10 border border-brand-200 rounded-md flex items-center justify-center hover:bg-brand-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              loading={addingToCart}
              className="flex-1"
            >
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleBuyNow}
              disabled={!inStock || addingToCart}
            >
              Buy Now
            </Button>
            <button
              onClick={() => toggleItem(product.id)}
              className={cn(
                'w-12 h-12 border rounded-md flex items-center justify-center transition-colors',
                inWishlist ? 'border-red-200 text-red-500' : 'border-brand-200 text-brand-400 hover:text-red-500'
              )}
            >
              <svg className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Vendor Card */}
          <Link
            href={`/vendors/${product.vendor.slug}`}
            className="mt-6 card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden">
              {product.vendor.logoUrl ? (
                <Image src={product.vendor.logoUrl} alt={product.vendor.name} width={48} height={48} className="object-cover" />
              ) : (
                <span className="text-lg font-bold text-brand-400">{product.vendor.name[0]}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-900">{product.vendor.name}</p>
              <p className="text-xs text-brand-500">View store</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex border-b border-brand-100">
          {(['description', 'specs', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab
                  ? 'border-brand-950 text-brand-950'
                  : 'border-transparent text-brand-500 hover:text-brand-900'
              )}
            >
              {tab === 'description' ? 'Description' : tab === 'specs' ? 'Specifications' : `Reviews (${product.reviewCount})`}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-brand-700 leading-relaxed">{product.description}</p>
              {product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-lg">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-brand-100">
                    <td className="py-2 text-brand-500">Brand</td>
                    <td className="py-2 text-brand-900 font-medium">{product.brand.name}</td>
                  </tr>
                  <tr className="border-b border-brand-100">
                    <td className="py-2 text-brand-500">SKU</td>
                    <td className="py-2 text-brand-900 font-medium">{product.sku}</td>
                  </tr>
                  {product.weight && (
                    <tr className="border-b border-brand-100">
                      <td className="py-2 text-brand-500">Weight</td>
                      <td className="py-2 text-brand-900 font-medium">{product.weight} kg</td>
                    </tr>
                  )}
                  <tr className="border-b border-brand-100">
                    <td className="py-2 text-brand-500">Sport</td>
                    <td className="py-2 text-brand-900 font-medium">{product.sportCategory?.name || '-'}</td>
                  </tr>
                  <tr className="border-b border-brand-100">
                    <td className="py-2 text-brand-500">Category</td>
                    <td className="py-2 text-brand-900 font-medium">{product.productType?.name || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {reviews.length === 0 ? (
                <p className="text-brand-500 text-sm">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-brand-100 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-xs font-medium">
                          {review.user.firstName[0]}
                          {review.user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-900">
                            {review.user.firstName} {review.user.lastName}
                          </p>
                          <div className="flex items-center gap-2">
                            <Rating value={review.rating} size="sm" />
                            <span className="text-xs text-brand-400">Verified Purchase</span>
                          </div>
                        </div>
                      </div>
                      {review.title && (
                        <h4 className="text-sm font-semibold text-brand-900 mt-3">{review.title}</h4>
                      )}
                      <p className="text-sm text-brand-600 mt-1">{review.body}</p>
                      {review.response && (
                        <div className="mt-3 pl-4 border-l-2 border-brand-200">
                          <p className="text-xs font-medium text-brand-500">Vendor Response:</p>
                          <p className="text-sm text-brand-600 mt-1">{review.response.body}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-brand-950 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
