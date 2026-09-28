import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { WishlistProvider } from '@/lib/wishlist';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Starfield } from '@/components/layout/Starfield';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Xeno - Premium Sportswear Marketplace',
  description: 'Shop premium sportswear, athletic clothing, footwear, and sports equipment from top vendors.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Starfield />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="relative min-h-screen flex flex-col z-10">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
