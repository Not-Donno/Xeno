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
    <header className="sticky top-0 z-50 glass border-b border-surface-border/50">
      <div className="container-x">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold tracking-tight text-star-white group-hover:text-accent transition-colors duration-300">
              XENO
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search products, brands, vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-light/50 border border-surface-border rounded-full text-sm text-star-white placeholder:text-star-blue/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300"
              />
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-star-blue/50 group-focus-within:text-accent transition-colors"
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
            <Link
              href="/products"
              className="text-sm text-star-blue/70 hover:text-accent transition-colors duration-300"
            >
              Shop
            </Link>
            <Link
              href="/vendors"
              className="text-sm text-star-blue/70 hover:text-accent transition-colors duration-300"
            >
              Vendors
            </Link>
            <Link
              href="/categories"
              className="text-sm text-star-blue/70 hover:text-accent transition-colors duration-300"
            >
              Categories
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="relative p-2.5 text-star-blue/60 hover:text-accent transition-colors duration-300 rounded-full hover:bg-surface-light/50"
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
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-accent text-space-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 text-star-blue/60 hover:text-accent transition-colors duration-300 rounded-full hover:bg-surface-light/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-accent text-space-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 text-sm text-star-blue/70 hover:text-accent transition-colors duration-300 rounded-full hover:bg-surface-light/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-cosmic-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <span className="hidden lg:inline text-sm">{user.firstName}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-52 glass rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-card-hover z-50">
                  <div className="p-2">
                    <Link
                      href="/account"
                      className="block px-3 py-2.5 text-sm text-star-blue/80 hover:bg-surface-light/50 hover:text-accent rounded-lg transition-colors"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      className="block px-3 py-2.5 text-sm text-star-blue/80 hover:bg-surface-light/50 hover:text-accent rounded-lg transition-colors"
                    >
                      Orders
                    </Link>
                    {user.role === 'VENDOR' && (
                      <Link
                        href="/vendor"
                        className="block px-3 py-2.5 text-sm text-star-blue/80 hover:bg-surface-light/50 hover:text-accent rounded-lg transition-colors"
                      >
                        Vendor Dashboard
                      </Link>
                    )}
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-3 py-2.5 text-sm text-star-blue/80 hover:bg-surface-light/50 hover:text-accent rounded-lg transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-2 border-surface-border" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-star-blue/70 hover:text-accent">
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
              className="md:hidden p-2.5 text-star-blue/60 hover:text-accent transition-colors rounded-full"
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
          <div className="md:hidden border-t border-surface-border/50 py-6 space-y-4 animate-fade-in-down">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
              />
            </form>
            <div className="flex flex-col gap-1">
              <Link href="/products" className="text-sm text-star-blue/80 py-2.5 px-3 rounded-lg hover:bg-surface-light/50 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
              <Link href="/vendors" className="text-sm text-star-blue/80 py-2.5 px-3 rounded-lg hover:bg-surface-light/50 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Vendors</Link>
              <Link href="/categories" className="text-sm text-star-blue/80 py-2.5 px-3 rounded-lg hover:bg-surface-light/50 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
              {!user && (
                <>
                  <Link href="/auth/login" className="text-sm text-star-blue/80 py-2.5 px-3 rounded-lg hover:bg-surface-light/50 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link href="/auth/register" className="text-sm text-star-blue/80 py-2.5 px-3 rounded-lg hover:bg-surface-light/50 hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
