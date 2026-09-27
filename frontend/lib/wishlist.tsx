'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { useAuth } from './auth';
import type { WishlistItem } from './types';

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistState | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<{ items: WishlistItem[] }>('/wishlist', token);
      setItems(res.items);
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
    async (productId: string) => {
      if (!token) throw new Error('Please login to add items to wishlist');
      const res = await api.post<{ items: WishlistItem[] }>(
        `/wishlist/${productId}`,
        {},
        token
      );
      setItems(res.items);
    },
    [token]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!token) return;
      const res = await api.delete<{ items: WishlistItem[] }>(
        `/wishlist/${productId}`,
        token
      );
      setItems(res.items);
    },
    [token]
  );

  const toggleItem = useCallback(
    async (productId: string) => {
      if (!token) throw new Error('Please login to manage wishlist');
      const res = await api.post<{ added: boolean }>(
        `/wishlist/${productId}/toggle`,
        {},
        token
      );
      await refresh();
      return;
    },
    [token, refresh]
  );

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.product.id === productId),
    [items]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        toggleItem,
        refresh,
        isInWishlist,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistState {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
