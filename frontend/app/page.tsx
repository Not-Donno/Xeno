import Link from 'next/link';
import Image from 'next/image';
import { serverFetch } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { Icon } from '@/components/ui/Icon';
import type { Product, Vendor, Category, Promotion } from '@/lib/types';

async function getHomeData() {
  try {
    const [featured, trending, newArrivals, vendors, sports, productTypes, promotions] =
      await Promise.all([
        serverFetch<{ products: Product[] }>('/products/featured'),
        serverFetch<{ products: Product[] }>('/products/trending'),
        serverFetch<{ products: Product[] }>('/products/new-arrivals'),
        serverFetch<{ vendors: Vendor[] }>('/vendors?limit=4'),
        serverFetch<{ categories: Category[] }>('/categories?type=SPORT'),
        serverFetch<{ categories: Category[] }>('/categories?type=PRODUCT_TYPE'),
        serverFetch<{ promotions: Promotion[] }>('/promotions'),
      ]);
    return {
      featured: featured.products,
      trending: trending.products,
      newArrivals: newArrivals.products,
      vendors: vendors.vendors,
      sports: sports.categories,
      productTypes: productTypes.categories,
      promotions: promotions.promotions,
    };
  } catch (err) {
    console.error('Home data fetch failed:', err);
    return {
      featured: [],
      trending: [],
      newArrivals: [],
      vendors: [],
      sports: [],
      productTypes: [],
      promotions: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-space-950 via-space-950/90 to-space-950" />
        <svg className="absolute -bottom-10 right-0 w-1/2 opacity-20" viewBox="0 0 400 200" fill="none" aria-hidden="true">
          <path d="M0 200 L120 0" stroke="#6366f1" strokeWidth="2" />
          <path d="M80 200 L200 0" stroke="#6366f1" strokeWidth="2" />
          <path d="M160 200 L280 0" stroke="#c4b5fd" strokeWidth="2" />
          <path d="M240 200 L360 0" stroke="#c4b5fd" strokeWidth="2" />
          <path d="M320 200 L440 0" stroke="#6366f1" strokeWidth="2" />
        </svg>
        <div className="relative container-x py-20">
          <div className="max-w-2xl animate-fade-in-up">
            <p className="mt-4 text-xs font-semibold tracking-[0.3em] uppercase text-accent">
              Athletic Wear Collection
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl lg:text-7xl font-black italic uppercase leading-tight">
              Gear Up.
              <br />
              <span className="text-gradient">Play Hard.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-star-blue/80 max-w-lg leading-relaxed">
              Premium sportswear, athletic clothing, and equipment from the world&apos;s top vendors.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/products">
                <Button variant="accent" size="lg">
                  Shop Now
                </Button>
              </Link>
              <Link href="/vendors">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white border border-white/20 hover:bg-white/10 hover:text-white hover:border-white/40"
                >
                  Meet the Vendors
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Athletic marquee strip */}
      <div className="overflow-hidden border-y border-surface-border py-3 select-none">
        <div className="flex w-max animate-marquee text-xs font-black italic uppercase tracking-[0.3em] text-star-blue/40">
          {Array.from({ length: 4 }).map((_, k) => (
            <span key={k} className="flex gap-10 pr-10">
              {['Run', 'Train', 'Win', 'Sprint', 'Endure', 'Repeat'].map((w) => (
                <span key={w}>{w} <span className="text-accent">—</span></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Popular Sports */}
      {data.sports.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-wide text-star-white">Popular Sports</h2>
            <Link href="/categories" className="text-sm text-star-blue/60 hover:text-accent transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {data.sports.slice(0, 8).map((sport, i) => (
              <Link
                key={sport.id}
                href={`/products?sport=${sport.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-xl hover:bg-surface-light/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Icon name={sport.icon || 'trophy'} size={28} className="text-accent transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-1" />
                <span className="text-sm text-center text-star-blue/80 font-medium">
                  {sport.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Shop by Product Type */}
      {data.productTypes.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-wide text-star-white">Shop by Category</h2>
            <Link href="/products" className="text-sm text-star-blue/60 hover:text-accent transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {data.productTypes.slice(0, 10).map((type, i) => (
              <Link
                key={type.id}
                href={`/products?type=${type.slug}`}
                className="relative group overflow-hidden rounded-xl aspect-[4/3] bg-surface-light animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-accent/30 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform group-hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-white text-sm font-medium">{type.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Promotional Banner */}
      {data.promotions.length > 0 && (
        <section className="container-x py-8">
          <Link href={data.promotions[0].linkUrl || '/products'} className="block relative overflow-hidden rounded-2xl group animate-fade-in">
            <div className="relative aspect-[3/1] bg-surface-light">
              {data.promotions[0].imageUrl && (
                <Image
                  src={data.promotions[0].imageUrl}
                  alt={data.promotions[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent group-hover:from-accent/20 transition-all duration-500" />
              <div className="absolute inset-0 flex items-center">
                <div className="p-6 md:p-10">
                  <h3 className="text-white text-xl md:text-3xl font-bold">
                    {data.promotions[0].title}
                  </h3>
                  {data.promotions[0].subtitle && (
                    <p className="text-star-blue/80 text-sm md:text-base mt-2">{data.promotions[0].subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Featured Products */}
      {data.featured.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-wide text-star-white">Featured Products</h2>
            <Link href="/products" className="text-sm text-star-blue/60 hover:text-accent transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {data.featured.slice(0, 8).map((product, i) => (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Products */}
      {data.trending.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-wide text-star-white">Trending Now</h2>
            <Link href="/products?sort=popular" className="text-sm text-star-blue/60 hover:text-accent transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {data.trending.slice(0, 8).map((product, i) => (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular Vendors */}
      {data.vendors.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-wide text-star-white">Popular Vendors</h2>
            <Link href="/vendors" className="text-sm text-star-blue/60 hover:text-accent transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {data.vendors.map((vendor, i) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.slug}`}
                className="card card-hover p-6 text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-surface-lighter flex items-center justify-center mb-4 overflow-hidden">
                  {vendor.logoUrl ? (
                    <Image
                      src={vendor.logoUrl}
                      alt={vendor.name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-accent">
                      {vendor.name[0]}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-star-white">{vendor.name}</h3>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Rating value={vendor.rating} size="sm" />
                  <span className="text-xs text-star-blue/60">({vendor.totalSales})</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {data.newArrivals.length > 0 && (
        <section className="container-x py-16 md:py-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-wide text-star-white">New Arrivals</h2>
            <Link href="/products?sort=newest" className="text-sm text-star-blue/60 hover:text-accent transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {data.newArrivals.slice(0, 8).map((product, i) => (
              <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container-x py-16 md:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-space-900 via-cosmic-900 to-space-900 p-10 md:p-16 text-center">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-bold text-white">Start Selling on Xeno</h2>
            <p className="mt-3 text-star-blue/70 max-w-lg mx-auto text-base md:text-lg">
              Join thousands of vendors selling premium sportswear to customers worldwide.
            </p>
            <Link href="/auth/register" className="inline-block mt-8">
              <Button variant="accent" size="lg">
                Become a Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
