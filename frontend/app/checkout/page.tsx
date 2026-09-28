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
        setAddresses(res.addresses || []);
        const defaultAddr = (res.addresses || []).find((a) => a.isDefault) || res.addresses?.[0];
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
    <div className="container-x py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-star-white mb-8 animate-fade-in">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-10 animate-fade-in-down">
        {['Address', 'Payment', 'Review'].map((label, idx) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step > idx + 1
                    ? 'bg-emerald-500 text-white'
                    : step === idx + 1
                      ? 'bg-accent text-white shadow-glow'
                      : 'bg-surface-lighter text-star-blue/40'
                }`}
              >
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span
                className={`text-sm ${
                  step === idx + 1 ? 'text-star-white font-medium' : 'text-star-blue/40'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < 2 && <div className="w-8 md:w-16 h-px bg-surface-border" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 mb-6 animate-fade-in">
              {error}
            </div>
          )}

          {/* Step 1: Address */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h2 className="text-lg font-semibold text-star-white mb-5">Shipping Address</h2>
              {addresses.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-star-blue/60 mb-4">You don&apos;t have any saved addresses.</p>
                  <Link href="/account/addresses">
                    <Button variant="primary">Add Address</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`card p-5 flex items-start gap-4 cursor-pointer transition-all duration-300 ${
                        selectedAddress === addr.id
                          ? 'border-accent/50 bg-accent/5 shadow-glow'
                          : 'hover:border-surface-border'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1 accent-accent"
                      />
                      <div>
                        <p className="text-sm font-medium text-star-white">
                          {addr.label} {addr.isDefault && <span className="text-accent text-xs">(Default)</span>}
                        </p>
                        <p className="text-sm text-star-blue/60 mt-1.5">
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
              <div className="flex justify-end mt-6">
                <Button variant="primary" onClick={() => setStep(2)} disabled={!selectedAddress}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <h2 className="text-lg font-semibold text-star-white mb-5">Payment Method</h2>
              <div className="card p-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'test'}
                    onChange={() => setPaymentMethod('test')}
                    className="accent-accent"
                  />
                  <div>
                    <p className="text-sm font-medium text-star-white">Test Payment</p>
                    <p className="text-xs text-star-blue/50 mt-0.5">Development mode — no real charge</p>
                  </div>
                </label>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button variant="primary" onClick={() => setStep(3)}>Review Order</Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <h2 className="text-lg font-semibold text-star-white mb-5">Review Order</h2>
              <div className="card p-5 space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-star-blue/70">
                      {item.variant.product.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-star-white">
                      {formatPrice((item.variant.price ?? item.variant.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button variant="accent" size="lg" onClick={handlePlaceOrder} loading={loading}>
                  Place Order — {formatPrice(total)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-star-white mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-star-blue/60">Subtotal</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
