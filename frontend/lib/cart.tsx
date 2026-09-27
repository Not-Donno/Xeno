'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { useAuth } from './auth';
import type { Cart } from './types';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<Cart>('/cart', token);
      setCart(res);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (variantId: string, quantity: number = 1) => {
      if (!token) throw new Error('Please login to add items to cart');
      const res = await api.post<Cart>('/cart/items', { variantId, quantity }, token);
      setCart(res);
    },
    [token]
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      if (!token) return;
      const res = await api.patch<Cart>(`/cart/items/${itemId}`, { quantity }, token);
      setCart(res);
    },
    [token]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!token) return;
      const res = await api.delete<Cart>(`/cart/items/${itemId}`, token);
      setCart(res);
    },
    [token]
  );

  const saveForLater = useCallback(
    async (itemId: string) => {
      if (!token) return;
      const res = await api.post<Cart>(`/cart/items/${itemId}/save-for-later`, {}, token);
      setCart(res);
    },
    [token]
  );

  const moveToCart = useCallback(
    async (itemId: string) => {
      if (!token) return;
      const res = await api.post<Cart>(`/cart/items/${itemId}/move-to-cart`, {}, token);
      setCart(res);
    },
    [token]
  );

  const itemCount = cart?.itemCount ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, addItem, updateItem, removeItem, saveForLater, moveToCart, refresh, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
