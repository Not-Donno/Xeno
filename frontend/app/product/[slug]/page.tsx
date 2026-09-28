'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { Price } from '@/components/ui/Price';
import { ProductCard } from '@/components/products/ProductCard';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product, Review } from '@/lib/types';
import { cn } from '@/lib/utils';

function ProductPageContent() {
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
    api.get<{ product: Product }>(`/products/${slug}`)
      .then((res) => {
        setProduct(res.product);
        if (res.product.variants?.length) {
          setSelectedColor(res.product.variants[0].color);
          setSelectedSize(res.product.variants[0].size);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get<{ products: Product[] }>(`/products/${slug}/related`)
      .then((res) => setRelated(res.products))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    api.get<{ reviews: Review[] }>(`/reviews/product/${product.id}`)
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
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="text-2xl font-bold text-star-white">Product not found</h1>
        <p className="text-star-blue/60 mt-2">The product you are looking for does not exist.</p>
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
    <div className="container-x py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-star-blue/50 mb-8 animate-fade-in">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-accent transition-colors">Products</Link>
        <span>/</span>
        <span className="text-star-white">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <div className="animate-fade-in-up">
          <div className="relative aspect-square bg-surface-light rounded-xl overflow-hidden mb-4">
            {product.images?.[selectedImage] ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.images[selectedImage].alt || product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-accent/40">
                <Icon name="box" size={64} />
              </div>
            )}
            {product.discountPrice && (
              <span className="absolute top-4 left-4 badge bg-accent text-white text-xs font-bold shadow-glow animate-pulse-slow">
                SALE
              </span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    'relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all duration-300',
                    selectedImage === idx
                      ? 'border-accent shadow-glow scale-105'
                      : 'border-transparent hover:border-surface-border'
                  )}
                >
                  <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="animate-fade-in-up animation-delay-200">
          <Link
            href={`/vendors/${product.vendor.slug}`}
            className="text-sm text-accent/70 hover:text-accent uppercase tracking-wider font-medium transition-colors"
          >
            {product.vendor.name}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-star-white mt-2">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <Rating value={product.rating} size="md" showValue />
            <span className="text-sm text-star-blue/50">({product.reviewCount} reviews)</span>
          </div>

          <div className="mt-4">
            <Price price={product.price} discountPrice={product.discountPrice} size="lg" />
          </div>

          {product.shortDescription && (
            <p className="mt-5 text-star-blue/70 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="mt-6">
              <label className="text-sm font-medium text-star-white">
                Color: <span className="text-accent">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2.5 mt-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'px-4 py-2 text-sm border rounded-lg transition-all duration-300',
                      selectedColor === color
                        ? 'border-accent bg-accent/10 text-accent shadow-glow'
                        : 'border-surface-border text-star-blue/70 hover:border-accent/50'
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
            <div className="mt-5">
              <label className="text-sm font-medium text-star-white">
                Size: <span className="text-accent">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2.5 mt-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'px-4 py-2 text-sm border rounded-lg transition-all duration-300 min-w-[48px]',
                      selectedSize === size
                        ? 'border-accent bg-accent/10 text-accent shadow-glow'
                        : 'border-surface-border text-star-blue/70 hover:border-accent/50'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mt-5">
            {inStock ? (
              <span className="text-sm text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                In Stock
              </span>
            ) : (
              <span className="text-sm text-red-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-400 rounded-full" />
                Out of Stock
              </span>
            )}
            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
              <span className="text-sm text-amber-400 ml-2">Only {selectedVariant.stock} left!</span>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-5">
            <label className="text-sm font-medium text-star-white">Quantity</label>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 border border-surface-border rounded-lg flex items-center justify-center hover:bg-surface-border transition-colors text-star-white"
              >
                -
              </button>
              <span className="w-12 text-center font-medium text-star-white">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 99, q + 1))}
                className="w-10 h-10 border border-surface-border rounded-lg flex items-center justify-center hover:bg-surface-border transition-colors text-star-white"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-7">
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
                'w-12 h-12 border rounded-lg flex items-center justify-center transition-all duration-300',
                inWishlist
                  ? 'border-red-500 text-red-500 bg-red-500/10'
                  : 'border-surface-border text-star-blue/40 hover:text-red-500 hover:border-red-500/50'
              )}
            >
              <svg className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Vendor Card */}
          <Link
            href={`/vendors/${product.vendor.slug}`}
            className="mt-6 card p-4 flex items-center gap-4 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-surface-lighter flex items-center justify-center overflow-hidden">
              {product.vendor.logoUrl ? (
                <Image src={product.vendor.logoUrl} alt={product.vendor.name} width={48} height={48} className="object-cover" />
              ) : (
                <span className="text-lg font-bold text-accent">{product.vendor.name[0]}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-star-white group-hover:text-accent transition-colors">{product.vendor.name}</p>
              <p className="text-xs text-star-blue/50">View store</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex border-b border-surface-border">
          {(['description', 'specs', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-300 capitalize',
                activeTab === tab
                  ? 'border-accent text-accent'
                  : 'border-transparent text-star-blue/50 hover:text-star-white'
              )}
            >
              {tab === 'specs' ? 'Specifications' : tab === 'reviews' ? `Reviews (${product.reviewCount})` : 'Description'}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none animate-fade-in">
              <p className="text-star-blue/70 leading-relaxed">{product.description}</p>
              {product.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="badge bg-accent/10 text-accent text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-lg animate-fade-in">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-surface-border/50">
                    <td className="py-3 text-star-blue/50">Brand</td>
                    <td className="py-3 text-star-white font-medium">{product.brand.name}</td>
                  </tr>
                  <tr className="border-b border-surface-border/50">
                    <td className="py-3 text-star-blue/50">SKU</td>
                    <td className="py-3 text-star-white font-medium">{product.sku}</td>
                  </tr>
                  {product.weight && (
                    <tr className="border-b border-surface-border/50">
                      <td className="py-3 text-star-blue/50">Weight</td>
                      <td className="py-3 text-star-white font-medium">{product.weight} kg</td>
                    </tr>
                  )}
                  <tr className="border-b border-surface-border/50">
                    <td className="py-3 text-star-blue/50">Sport</td>
                    <td className="py-3 text-star-white font-medium">{product.sportCategory?.name || '-'}</td>
                  </tr>
                  <tr className="border-b border-surface-border/50">
                    <td className="py-3 text-star-blue/50">Category</td>
                    <td className="py-3 text-star-white font-medium">{product.productType?.name || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-fade-in">
              {reviews.length === 0 ? (
                <p className="text-star-blue/50 text-sm">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-surface-border/50 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-cosmic-500 flex items-center justify-center text-xs font-bold text-white">
                          {review.user.firstName[0]}
                          {review.user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-star-white">
                            {review.user.firstName} {review.user.lastName}
                          </p>
                          <div className="flex items-center gap-2">
                            <Rating value={review.rating} size="sm" />
                            <span className="text-[10px] text-emerald-400 font-medium bg-emerald-400/10 px-1.5 py-0.5 rounded">Verified Purchase</span>
                          </div>
                        </div>
                      </div>
                      {review.title && (
                        <h4 className="text-sm font-semibold text-star-white mt-3">{review.title}</h4>
                      )}
                      <p className="text-sm text-star-blue/60 mt-1.5">{review.body}</p>
                      {review.response && (
                        <div className="mt-3 pl-4 border-l-2 border-accent/30 bg-surface-light/30 p-3 rounded-r-lg">
                          <p className="text-xs font-medium text-accent/80">Vendor Response:</p>
                          <p className="text-sm text-star-blue/60 mt-1">{review.response.body}</p>
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
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-star-white mb-8">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div className="container-x py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    }>
      <ProductPageContent />
    </Suspense>
  );
}
