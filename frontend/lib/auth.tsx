'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';
import type { User } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setToken: (token: string | null) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('xeno_token');
    if (storedToken) {
      setTokenState(storedToken);
      api
        .get<{ user: User }>('/auth/me', storedToken)
        .then((res) => setUser(res.user))
        .catch(() => {
          localStorage.removeItem('xeno_token');
          setTokenState(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('xeno_token', newToken);
    } else {
      localStorage.removeItem('xeno_token');
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{ user: User; accessToken: string }>('/auth/login', {
        email,
        password,
      });
      setToken(res.accessToken);
      setUser(res.user);
    },
    [setToken]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const res = await api.post<{ user: User; accessToken: string }>(
        '/auth/register',
        data
      );
      setToken(res.accessToken);
      setUser(res.user);
    },
    [setToken]
  );

  const logout = useCallback(() => {
    if (token) {
      api.post('/auth/logout', { refreshToken: null }, token).catch(() => {});
    }
    setToken(null);
    setUser(null);
  }, [token, setToken]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get<{ user: User }>('/auth/me', token);
      setUser(res.user);
    } catch {
      // token invalid
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, refreshUser, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
