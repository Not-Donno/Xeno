import Link from 'next/link';
import Image from 'next/image';
import { api, serverFetch } from '@/lib/api';
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
      <section className="relative bg-brand-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/xeno-hero/1920/600"
            alt="Hero"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="relative container-x py-24 md:py-36 lg:py-44">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Gear Up.<br />
              <span className="text-accent">Play Hard.</span>
            </h1>
            <p className="mt-6 text-lg text-brand-300 max-w-lg">
              Premium sportswear, athletic clothing, and equipment from the world&apos;s top vendors.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/products">
                <Button variant="accent" size="lg">
                  Shop Now
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white border border-white/30 hover:bg-white/10 hover:text-white"
                >
                  Explore Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Sports */}
      {data.sports.length > 0 && (
        <section className="container-x py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-brand-950">Popular Sports</h2>
            <Link href="/categories" className="text-sm text-brand-500 hover:text-brand-950">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {data.sports.slice(0, 8).map((sport) => (
              <Link
                key={sport.id}
                href={`/products?sport=${sport.slug}`}
                className="flex flex-col items-center gap-3 p-5 rounded-lg hover:bg-brand-50 transition-colors"
              >
                <Icon name={sport.icon || 'trophy'} size={28} className="text-brand-700" />
                <span className="text-sm text-center text-brand-600 font-medium">
                  {sport.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Shop by Product Type */}
      {data.productTypes.length > 0 && (
        <section className="container-x py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-brand-950">Shop by Category</h2>
            <Link href="/products" className="text-sm text-brand-500 hover:text-brand-950">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {data.productTypes.slice(0, 10).map((type) => (
              <Link
                key={type.id}
                href={`/products?type=${type.slug}`}
                className="relative group overflow-hidden rounded-lg aspect-[4/3] bg-brand-100"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-white text-sm font-medium">{type.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Promotional Banner */}
      {data.promotions.length > 0 && (
        <section className="container-x py-6">
          <Link href={data.promotions[0].linkUrl || '/products'} className="block relative overflow-hidden rounded-xl">
            <div className="relative aspect-[3/1] bg-brand-900">
              {data.promotions[0].imageUrl && (
                <Image
                  src={data.promotions[0].imageUrl}
                  alt={data.promotions[0].title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="p-6 md:p-10">
                  <h3 className="text-white text-xl md:text-2xl font-bold">
                    {data.promotions[0].title}
                  </h3>
                  {data.promotions[0].subtitle && (
                    <p className="text-brand-200 text-sm mt-1">{data.promotions[0].subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Featured Products */}
      {data.featured.length > 0 && (
        <section className="container-x py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-brand-950">Featured Products</h2>
            <Link href="/products" className="text-sm text-brand-500 hover:text-brand-950">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {data.featured.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Products */}
      {data.trending.length > 0 && (
        <section className="container-x py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-brand-950">Trending Now</h2>
            <Link href="/products?sort=popular" className="text-sm text-brand-500 hover:text-brand-950">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {data.trending.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Vendors */}
      {data.vendors.length > 0 && (
        <section className="container-x py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-brand-950">Popular Vendors</h2>
            <Link href="/vendors" className="text-sm text-brand-500 hover:text-brand-950">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {data.vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.slug}`}
                className="card p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-brand-100 flex items-center justify-center mb-4 overflow-hidden">
                  {vendor.logoUrl ? (
                    <Image
                      src={vendor.logoUrl}
                      alt={vendor.name}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-brand-400">
                      {vendor.name[0]}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-brand-900">{vendor.name}</h3>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Rating value={vendor.rating} size="sm" />
                  <span className="text-xs text-brand-400">({vendor.totalSales})</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {data.newArrivals.length > 0 && (
        <section className="container-x py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-brand-950">New Arrivals</h2>
            <Link href="/products?sort=newest" className="text-sm text-brand-500 hover:text-brand-950">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {data.newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="container-x py-12">
        <div className="bg-brand-950 rounded-xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold">Start Selling on Xeno</h2>
          <p className="mt-2 text-brand-300 max-w-lg mx-auto">
            Join thousands of vendors selling premium sportswear to customers worldwide.
          </p>
          <Link href="/auth/register" className="inline-block mt-6">
            <Button variant="accent" size="lg">
              Become a Vendor
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
