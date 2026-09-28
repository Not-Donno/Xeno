import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-surface-border/50 bg-surface/50 backdrop-blur-sm mt-16">
      <div className="container-x py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div>
            <h3 className="text-xl font-bold text-star-white mb-4">XENO</h3>
            <p className="text-sm text-star-blue/60 leading-relaxed">
              The marketplace for premium sportswear, athletic clothing, and sports equipment.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-star-white mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3 text-sm text-star-blue/60">
              <li><Link href="/products" className="hover:text-accent transition-colors">All Products</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-accent transition-colors">New Arrivals</Link></li>
              <li><Link href="/products?onSale=true" className="hover:text-accent transition-colors">Sale</Link></li>
              <li><Link href="/vendors" className="hover:text-accent transition-colors">Vendors</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-star-white mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-sm text-star-blue/60">
              <li><Link href="/account/orders" className="hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link href="/account" className="hover:text-accent transition-colors">My Account</Link></li>
              <li><Link href="/auth/register" className="hover:text-accent transition-colors">Become a Vendor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-star-white mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-star-blue/60">
              <li><Link href="/categories" className="hover:text-accent transition-colors">Categories</Link></li>
              <li><Link href="/products?sort=popular" className="hover:text-accent transition-colors">Popular</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-border/50 mt-12 pt-8 text-center text-sm text-star-blue/40">
          &copy; {new Date().getFullYear()} Xeno. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
