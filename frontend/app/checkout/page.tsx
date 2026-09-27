'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice } from '@/lib/utils';
import type { Address, Order } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { cart, refresh } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('test');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    api.get<{ addresses: Address[] }>('/users/me/addresses', token)
      .then((res) => {
        setAddresses(res.addresses);
        const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      })
      .catch(() => {});
  }, [token, router]);

  if (!token) return null;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState
          title="Your cart is empty"
          description="Add some products before checking out."
          action={{ label: 'Browse Products', onClick: () => (window.location.href = '/products') }}
        />
      </div>
    );
  }

  const shipping = cart.subtotal >= 100 ? 0 : 9.99;
  const tax = cart.subtotal * 0.08;
  const total = cart.subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a shipping address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ order: Order }>(
        '/orders',
        { addressId: selectedAddress, paymentMethod },
        token
      );
      await refresh();
      router.push(`/account/orders/${res.order.id}?success=true`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold text-brand-950 mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {['Address', 'Payment', 'Review'].map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step > idx + 1 ? 'bg-green-500 text-white' : step === idx + 1 ? 'bg-brand-950 text-white' : 'bg-brand-100 text-brand-500'
            }`}>
              {step > idx + 1 ? '✓' : idx + 1}
            </div>
            <span className={`text-sm ${step === idx + 1 ? 'font-medium text-brand-950' : 'text-brand-500'}`}>
              {label}
            </span>
            {idx < 2 && <div className="w-8 h-px bg-brand-200" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Address */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-brand-950">Shipping Address</h2>
              {addresses.length === 0 ? (
                <div className="card p-6 text-center">
                  <p className="text-brand-600 mb-4">You don&apos;t have any saved addresses.</p>
                  <Link href="/account/addresses">
                    <Button variant="primary">Add Address</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`card p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                        selectedAddress === addr.id ? 'border-brand-950 bg-brand-50' : 'hover:border-brand-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-brand-900">
                          {addr.label} {addr.isDefault && <span className="text-xs text-brand-500">(Default)</span>}
                        </p>
                        <p className="text-sm text-brand-600 mt-1">
                          {addr.name}<br />
                          {addr.line1}<br />
                          {addr.city}, {addr.state} {addr.postalCode}<br />
                          {addr.country}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="primary" onClick={() => setStep(2)} disabled={!selectedAddress}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-brand-950">Payment Method</h2>
              <div className="card p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'test'}
                    onChange={() => setPaymentMethod('test')}
                  />
                  <div>
                    <p className="text-sm font-medium text-brand-900">Test Payment</p>
                    <p className="text-xs text-brand-500">Development mode — no real charge</p>
                  </div>
                </label>
              </div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button variant="primary" onClick={() => setStep(3)}>Review Order</Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-brand-950">Review Order</h2>
              <div className="card p-4 space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-brand-700">
                      {item.variant.product.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice((item.variant.price ?? item.variant.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button variant="primary" size="lg" onClick={handlePlaceOrder} loading={loading}>
                  Place Order — {formatPrice(total)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-brand-950 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-600">Subtotal</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-600">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-600">Tax</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              <hr className="border-brand-100" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
