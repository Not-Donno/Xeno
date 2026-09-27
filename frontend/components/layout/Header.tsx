'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-100">
      <div className="container-x">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-brand-950">XENO</span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-brand-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-950 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm text-brand-600 hover:text-brand-950">
              Shop
            </Link>
            <Link href="/vendors" className="text-sm text-brand-600 hover:text-brand-950">
              Vendors
            </Link>
            <Link href="/categories" className="text-sm text-brand-600 hover:text-brand-950">
              Categories
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="relative p-2 text-brand-600 hover:text-brand-950"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-brand-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-brand-600 hover:text-brand-950">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-brand-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 text-sm text-brand-700 hover:text-brand-950">
                  <div className="w-7 h-7 rounded-full bg-brand-200 flex items-center justify-center text-xs font-medium">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <span className="hidden lg:inline">{user.firstName}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-brand-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2">
                    <Link
                      href="/account"
                      className="block px-3 py-2 text-sm text-brand-700 hover:bg-brand-50 rounded"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      className="block px-3 py-2 text-sm text-brand-700 hover:bg-brand-50 rounded"
                    >
                      Orders
                    </Link>
                    {user.role === 'VENDOR' && (
                      <Link
                        href="/vendor"
                        className="block px-3 py-2 text-sm text-brand-700 hover:bg-brand-50 rounded"
                      >
                        Vendor Dashboard
                      </Link>
                    )}
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-3 py-2 text-sm text-brand-700 hover:bg-brand-50 rounded"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-brand-100" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-brand-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-100 py-4 space-y-3">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
              />
            </form>
            <div className="flex flex-col gap-2">
              <Link href="/products" className="text-sm text-brand-700 py-1" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
              <Link href="/vendors" className="text-sm text-brand-700 py-1" onClick={() => setMobileMenuOpen(false)}>Vendors</Link>
              <Link href="/categories" className="text-sm text-brand-700 py-1" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
              {!user && (
                <>
                  <Link href="/auth/login" className="text-sm text-brand-700 py-1" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link href="/auth/register" className="text-sm text-brand-700 py-1" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
