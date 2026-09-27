'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Price } from '@/components/ui/Price';
import { formatPrice } from '@/lib/utils';

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

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold text-brand-950 mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <Link href={`/product/${item.variant.product.slug}`} className="shrink-0">
                <div className="relative w-24 h-24 bg-brand-50 rounded-md overflow-hidden">
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
                <Link href={`/product/${item.variant.product.slug}`} className="text-sm font-medium text-brand-900 hover:text-brand-600 line-clamp-2">
                  {item.variant.product.name}
                </Link>
                <p className="text-xs text-brand-500 mt-1">
                  {item.variant.color} / {item.variant.size}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateItem(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-brand-200 rounded flex items-center justify-center hover:bg-brand-50 text-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-brand-200 rounded flex items-center justify-center hover:bg-brand-50 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Price
                      price={item.variant.price ?? item.variant.product.price}
                      size="sm"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-brand-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => saveForLater(item.id)}
                  className="text-xs text-brand-500 hover:text-brand-950 mt-2"
                >
                  Save for later
                </button>
              </div>
            </div>
          ))}

          {/* Saved for Later */}
          {cart.savedForLater.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-brand-950 mb-4">Saved for Later</h2>
              <div className="space-y-4">
                {cart.savedForLater.map((item) => (
                  <div key={item.id} className="card p-4 flex gap-4 opacity-60">
                    <div className="relative w-24 h-24 bg-brand-50 rounded-md overflow-hidden shrink-0">
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
                      <p className="text-sm font-medium text-brand-900">{item.variant.product.name}</p>
                      <p className="text-xs text-brand-500 mt-1">{item.variant.color} / {item.variant.size}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => moveToCart(item.id)}
                          className="text-xs text-brand-950 font-medium hover:underline"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-brand-500 hover:text-red-500"
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
            <h2 className="text-lg font-semibold text-brand-950 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-600">Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-600">Shipping</span>
                <span className="font-medium">{cart.subtotal >= 100 ? 'FREE' : formatPrice(9.99)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-600">Tax</span>
                <span className="font-medium">{formatPrice(cart.subtotal * 0.08)}</span>
              </div>
              <hr className="border-brand-100" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(cart.subtotal + (cart.subtotal >= 100 ? 0 : 9.99) + cart.subtotal * 0.08)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block mt-6">
              <Button variant="primary" size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>
            <Link href="/products" className="block mt-3 text-center">
              <Button variant="ghost" className="w-full">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
