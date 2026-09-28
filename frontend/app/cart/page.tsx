'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cart, updateItem, removeItem, saveForLater, moveToCart, loading } = useCart();
  const { token } = useAuth();

  if (!token) {
    return (
      <div className="container-x py-16">
        <EmptyState
          title="Please login"
          description="You need to be logged in to view your cart."
          action={{ label: 'Login', onClick: () => (window.location.href = '/auth/login') }}
        />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={{ label: 'Start Shopping', onClick: () => (window.location.href = '/products') }}
        />
      </div>
    );
  }

  const shipping = cart.subtotal >= 100 ? 0 : 9.99;
  const tax = cart.subtotal * 0.08;
  const total = cart.subtotal + shipping + tax;

  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-star-white mb-8 animate-fade-in">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, i) => (
            <div
              key={item.id}
              className="card p-4 md:p-5 flex gap-4 md:gap-5 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Link href={`/product/${item.variant.product.slug}`} className="shrink-0">
                <div className="relative w-24 h-24 md:w-28 md:h-28 bg-surface-lighter rounded-lg overflow-hidden">
                  {item.variant.product.images?.[0] && (
                    <Image
                      src={item.variant.product.images[0].url}
                      alt={item.variant.product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.variant.product.slug}`}
                  className="text-sm font-medium text-star-white hover:text-accent transition-colors line-clamp-2"
                >
                  {item.variant.product.name}
                </Link>
                <p className="text-xs text-star-blue/50 mt-1">
                  {item.variant.color} / {item.variant.size}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateItem(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-surface-border rounded-lg flex items-center justify-center hover:bg-surface-border transition-colors text-star-white text-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-star-white">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-surface-border rounded-lg flex items-center justify-center hover:bg-surface-border transition-colors text-star-white text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-star-white">
                      {formatPrice((item.variant.price ?? item.variant.product.price) * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-star-blue/40 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => saveForLater(item.id)}
                  className="text-xs text-star-blue/50 hover:text-accent mt-2 transition-colors"
                >
                  Save for later
                </button>
              </div>
            </div>
          ))}

          {/* Saved for Later */}
          {cart.savedForLater.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-star-white mb-4">Saved for Later</h2>
              <div className="space-y-4">
                {cart.savedForLater.map((item) => (
                  <div key={item.id} className="card p-4 flex gap-4 opacity-60">
                    <div className="relative w-20 h-20 bg-surface-lighter rounded-lg overflow-hidden shrink-0">
                      {item.variant.product.images?.[0] && (
                        <Image
                          src={item.variant.product.images[0].url}
                          alt={item.variant.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-star-white">{item.variant.product.name}</p>
                      <p className="text-xs text-star-blue/50 mt-1">{item.variant.color} / {item.variant.size}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => moveToCart(item.id)}
                          className="text-xs text-accent font-medium hover:underline"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-star-blue/50 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-star-white mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-star-blue/60">Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium text-star-white">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-star-blue/60">Shipping</span>
                <span className="font-medium text-star-white">
                  {shipping === 0 ? <span className="text-emerald-400">FREE</span> : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-star-blue/60">Tax</span>
                <span className="font-medium text-star-white">{formatPrice(tax)}</span>
              </div>
              <hr className="border-surface-border" />
              <div className="flex justify-between text-base font-bold">
                <span className="text-star-white">Total</span>
                <span className="text-accent">{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block mt-6">
              <Button variant="primary" size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>
            <Link href="/products" className="block mt-3 text-center">
              <Button variant="ghost" className="w-full text-star-blue/60">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
