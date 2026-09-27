import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-brand-950 text-white mt-16">
      <div className="container-x py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">XENO</h3>
            <p className="text-sm text-brand-400">
              The marketplace for premium sportswear, athletic clothing, and sports equipment.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-brand-400">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-white">New Arrivals</Link></li>
              <li><Link href="/products?onSale=true" className="hover:text-white">Sale</Link></li>
              <li><Link href="/vendors" className="hover:text-white">Vendors</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-brand-400">
              <li><Link href="/account/orders" className="hover:text-white">Track Order</Link></li>
              <li><Link href="/account" className="hover:text-white">My Account</Link></li>
              <li><Link href="/auth/register" className="hover:text-white">Become a Vendor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-brand-400">
              <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link href="/products?sort=popular" className="hover:text-white">Popular</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-brand-800 mt-8 pt-8 text-center text-sm text-brand-500">
          &copy; {new Date().getFullYear()} Xeno. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
