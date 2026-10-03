import {
  PrismaClient,
  Role,
  CategoryType,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  VendorStatus,
  ReviewStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Relative photo paths (served from the app's public/uploads folder)
function img(id: string, w = 800, h = 800): string {
  return `/images/${id}.jpg`;
}

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.reviewResponse.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================
  // USERS
  // ============================================================
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const vendorPassword = await bcrypt.hash('Vendor123!', 12);
  const customerPassword = await bcrypt.hash('Customer123!', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@xeno.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });

  const vendorUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'donno@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Donno',
        lastName: 'Sports',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'atomicrush@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Atomic',
        lastName: 'Rush',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'zerogravity@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Zero',
        lastName: 'Gravity',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'cosmodrive@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Cosmo',
        lastName: 'Drive',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'krabbyrun@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Krabby',
        lastName: 'Run',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
  ]);

  const customerUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
        passwordHash: customerPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: Role.CUSTOMER,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        passwordHash: customerPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        role: Role.CUSTOMER,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike@example.com',
        passwordHash: customerPassword,
        firstName: 'Mike',
        lastName: 'Johnson',
        role: Role.CUSTOMER,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma@example.com',
        passwordHash: customerPassword,
        firstName: 'Emma',
        lastName: 'Brown',
        role: Role.CUSTOMER,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'alex@example.com',
        passwordHash: customerPassword,
        firstName: 'Alex',
        lastName: 'Davis',
        role: Role.CUSTOMER,
        emailVerified: true,
      },
    }),
  ]);

  // ============================================================
  // VENDORS
  // ============================================================
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        userId: vendorUsers[0].id,
        slug: 'donno',
        name: 'Donno',
        description:
          'Donno is a premium sportswear brand focused on running and training gear. Our products are designed for athletes who demand the best performance and comfort.',
        logoUrl: img('donno-logo', 200, 200),
        bannerUrl: img('donno-banner', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.7,
        totalSales: 1250,
        socialLinks: {
          website: 'https://donno.com',
          instagram: '@donno',
          twitter: '@donno',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[1].id,
        slug: 'atomic-rush',
        name: 'AtomicRush',
        description:
          'AtomicRush specializes in high-performance athletic footwear and apparel. We combine cutting-edge technology with sleek design to help you push your limits.',
        logoUrl: img('atomicrush-logo', 200, 200),
        bannerUrl: img('atomicrush-banner', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.5,
        totalSales: 980,
        socialLinks: {
          website: 'https://atomicrush.com',
          instagram: '@atomicrush',
          twitter: '@atomicrush',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[2].id,
        slug: 'zero-gravity',
        name: 'Zero Gravity',
        description:
          'Zero Gravity offers innovative sportswear that feels like a second skin. Our mission is to help athletes achieve peak performance with lightweight, breathable gear.',
        logoUrl: img('zerogravity-logo', 200, 200),
        bannerUrl: img('zerogravity-banner', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.3,
        totalSales: 720,
        socialLinks: {
          website: 'https://zerogravity.com',
          instagram: '@zerogravity',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[3].id,
        slug: 'cosmo-drive',
        name: 'CosmoDrive',
        description:
          'CosmoDrive brings futuristic design to sportswear. Our products are inspired by space exploration and built for athletes who want to stand out.',
        logoUrl: img('cosmodrive-logo', 200, 200),
        bannerUrl: img('cosmodrive-banner', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.6,
        totalSales: 650,
        socialLinks: {
          website: 'https://cosmodrive.com',
          instagram: '@cosmodrive',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[4].id,
        slug: 'krabby-run',
        name: 'Krabby Run',
        description:
          'Krabby Run is a fun, energetic brand that makes sportswear for runners of all levels. Our gear is colorful, comfortable, and built to last.',
        logoUrl: img('krabbyrun-logo', 200, 200),
        bannerUrl: img('krabbyrun-banner', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.4,
        totalSales: 580,
        socialLinks: {
          website: 'https://krabbyrun.com',
          instagram: '@krabbyrun',
        },
      },
    }),
  ]);

  // ============================================================
  // CATEGORIES - Sports
  // ============================================================
  const sports = await Promise.all([
    prisma.category.create({ data: { name: 'Running', slug: 'running', type: CategoryType.SPORT, icon: 'runner', description: 'Running shoes, apparel and accessories', sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'Football', slug: 'football', type: CategoryType.SPORT, icon: 'football', description: 'Football boots, jerseys and equipment', sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'Basketball', slug: 'basketball', type: CategoryType.SPORT, icon: 'basketball', description: 'Basketball shoes, jerseys and gear', sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'Tennis', slug: 'tennis', type: CategoryType.SPORT, icon: 'tennis', description: 'Tennis rackets, shoes and apparel', sortOrder: 4 } }),
    prisma.category.create({ data: { name: 'Gym & Fitness', slug: 'gym-fitness', type: CategoryType.SPORT, icon: 'gym', description: 'Gym equipment, weights and fitness apparel', sortOrder: 5 } }),
    prisma.category.create({ data: { name: 'Training', slug: 'training', type: CategoryType.SPORT, icon: 'training', description: 'Training apparel and accessories', sortOrder: 6 } }),
  ]);

  // ============================================================
  // CATEGORIES - Product Types
  // ============================================================
  const productTypes = await Promise.all([
    prisma.category.create({ data: { name: 'Shoes', slug: 'shoes', type: CategoryType.PRODUCT_TYPE, icon: 'shoe', description: 'Athletic footwear for all sports', sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'T-Shirts', slug: 't-shirts', type: CategoryType.PRODUCT_TYPE, icon: 'shirt', description: 'Athletic tops and t-shirts', sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'Jerseys', slug: 'jerseys', type: CategoryType.PRODUCT_TYPE, icon: 'jersey', description: 'Team jerseys and kits', sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'Shorts', slug: 'shorts', type: CategoryType.PRODUCT_TYPE, icon: 'shorts', description: 'Athletic shorts', sortOrder: 4 } }),
    prisma.category.create({ data: { name: 'Pants', slug: 'pants', type: CategoryType.PRODUCT_TYPE, icon: 'pants', description: 'Athletic pants and tights', sortOrder: 5 } }),
    prisma.category.create({ data: { name: 'Hoodies', slug: 'hoodies', type: CategoryType.PRODUCT_TYPE, icon: 'hoodie', description: 'Hoodies and sweatshirts', sortOrder: 6 } }),
    prisma.category.create({ data: { name: 'Jackets', slug: 'jackets', type: CategoryType.PRODUCT_TYPE, icon: 'jacket', description: 'Sports jackets and windbreakers', sortOrder: 7 } }),
    prisma.category.create({ data: { name: 'Tracksuits', slug: 'tracksuits', type: CategoryType.PRODUCT_TYPE, icon: 'tracksuit', description: 'Matching tracksuit sets', sortOrder: 8 } }),
    prisma.category.create({ data: { name: 'Socks', slug: 'socks', type: CategoryType.PRODUCT_TYPE, icon: 'socks', description: 'Athletic socks', sortOrder: 9 } }),
    prisma.category.create({ data: { name: 'Caps', slug: 'caps', type: CategoryType.PRODUCT_TYPE, icon: 'cap', description: 'Caps, visors and headwear', sortOrder: 10 } }),
    prisma.category.create({ data: { name: 'Gloves', slug: 'gloves', type: CategoryType.PRODUCT_TYPE, icon: 'gloves', description: 'Sports gloves', sortOrder: 11 } }),
    prisma.category.create({ data: { name: 'Bags', slug: 'bags', type: CategoryType.PRODUCT_TYPE, icon: 'bag', description: 'Sports bags and backpacks', sortOrder: 12 } }),
    prisma.category.create({ data: { name: 'Accessories', slug: 'accessories', type: CategoryType.PRODUCT_TYPE, icon: 'watch', description: 'Sports accessories', sortOrder: 13 } }),
    prisma.category.create({ data: { name: 'Equipment', slug: 'equipment', type: CategoryType.PRODUCT_TYPE, icon: 'ball', description: 'Sports equipment', sortOrder: 14 } }),
  ]);

  // ============================================================
  // BRANDS
  // ============================================================
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'Donno', slug: 'donno' } }),
    prisma.brand.create({ data: { name: 'AtomicRush', slug: 'atomicrush' } }),
    prisma.brand.create({ data: { name: 'Zero Gravity', slug: 'zero-gravity' } }),
    prisma.brand.create({ data: { name: 'CosmoDrive', slug: 'cosmodrive' } }),
    prisma.brand.create({ data: { name: 'Krabby Run', slug: 'krabby-run' } }),
  ]);

  // ============================================================
  // PRODUCTS
  // ============================================================
  const shoeSizes = ['7', '8', '9', '10', '11', '12'];
  const apparelSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Grey'];

  interface ProductSeed {
    name: string;
    price: number;
    discountPrice: number | null;
    brandIdx: number;
    sportIdx: number;
    typeIdx: number;
    vendorIdx: number;
    tags: string[];
    isFeatured?: boolean;
    isTrending?: boolean;
    isNewArrival?: boolean;
  }

  const products: ProductSeed[] = [
    // Donno
    { name: 'Velocity Pro Jersey', price: 34.99, discountPrice: 29.99, brandIdx: 0, sportIdx: 0, typeIdx: 2, vendorIdx: 0, tags: ['jersey', 'donno', 'sportswear'], isFeatured: true, isTrending: true, isNewArrival: true },
    { name: 'ShadowFlex Training Tee', price: 29.99, discountPrice: null, brandIdx: 0, sportIdx: 5, typeIdx: 1, vendorIdx: 0, tags: ['t-shirt', 'donno', 'sportswear'], isNewArrival: true },
    { name: 'Apex Runner Shorts', price: 35.99, discountPrice: null, brandIdx: 0, sportIdx: 0, typeIdx: 3, vendorIdx: 0, tags: ['shorts', 'donno', 'sportswear'], isNewArrival: true },
    { name: 'StreetCore Jersey', price: 40.99, discountPrice: 35.99, brandIdx: 0, sportIdx: 0, typeIdx: 2, vendorIdx: 0, tags: ['jersey', 'donno', 'sportswear'], isNewArrival: true },
    { name: 'SprintX Performance Tee', price: 35.99, discountPrice: null, brandIdx: 0, sportIdx: 0, typeIdx: 1, vendorIdx: 0, tags: ['t-shirt', 'donno', 'sportswear'], isNewArrival: true },
    { name: 'Motion Elite Jacket', price: 79.99, discountPrice: null, brandIdx: 0, sportIdx: 0, typeIdx: 6, vendorIdx: 0, tags: ['sports-jacket', 'donno', 'sportswear'], isTrending: true, isNewArrival: true },
    { name: 'Endurance Pro Shorts', price: 33.99, discountPrice: 28.99, brandIdx: 0, sportIdx: 0, typeIdx: 3, vendorIdx: 0, tags: ['shorts', 'donno', 'sportswear'], isNewArrival: true },
    // AtomicRush
    { name: 'Atomic Sprint Jersey', price: 38.99, discountPrice: null, brandIdx: 1, sportIdx: 0, typeIdx: 2, vendorIdx: 1, tags: ['jersey', 'atomicrush', 'sportswear'], isFeatured: true, isNewArrival: true },
    { name: 'NuclearFlex Performance Tee', price: 33.99, discountPrice: null, brandIdx: 1, sportIdx: 0, typeIdx: 1, vendorIdx: 1, tags: ['t-shirt', 'atomicrush', 'sportswear'] },
    { name: 'Reactor Run Shorts', price: 39.99, discountPrice: 34.99, brandIdx: 1, sportIdx: 0, typeIdx: 3, vendorIdx: 1, tags: ['shorts', 'atomicrush', 'sportswear'] },
    { name: 'Fusion Pro Jersey', price: 34.99, discountPrice: null, brandIdx: 1, sportIdx: 0, typeIdx: 2, vendorIdx: 1, tags: ['jersey', 'atomicrush', 'sportswear'], isTrending: true },
    { name: 'EnergyCore Training Tee', price: 29.99, discountPrice: null, brandIdx: 1, sportIdx: 5, typeIdx: 1, vendorIdx: 1, tags: ['t-shirt', 'atomicrush', 'sportswear'] },
    { name: 'PulseX Running Jacket', price: 78.99, discountPrice: 73.99, brandIdx: 1, sportIdx: 0, typeIdx: 6, vendorIdx: 1, tags: ['running-jacket', 'atomicrush', 'sportswear'] },
    { name: 'AtomForce Track Pants', price: 60.99, discountPrice: null, brandIdx: 1, sportIdx: 0, typeIdx: 4, vendorIdx: 1, tags: ['track-pants', 'atomicrush', 'sportswear'] },
    { name: 'Reactor Elite Shorts', price: 39.99, discountPrice: null, brandIdx: 1, sportIdx: 0, typeIdx: 3, vendorIdx: 1, tags: ['shorts', 'atomicrush', 'sportswear'], isFeatured: true },
    { name: 'HyperCharge Jersey', price: 34.99, discountPrice: 29.99, brandIdx: 1, sportIdx: 0, typeIdx: 2, vendorIdx: 1, tags: ['jersey', 'atomicrush', 'sportswear'], isTrending: true },
    { name: 'CoreBlast Training Set', price: 91.99, discountPrice: null, brandIdx: 1, sportIdx: 5, typeIdx: 7, vendorIdx: 1, tags: ['training-set', 'atomicrush', 'sportswear'] },
    { name: 'AtomicFlex Windbreaker', price: 68.99, discountPrice: null, brandIdx: 1, sportIdx: 0, typeIdx: 6, vendorIdx: 1, tags: ['windbreaker', 'atomicrush', 'sportswear'] },
    { name: 'PowerCore Running Tee', price: 33.99, discountPrice: 28.99, brandIdx: 1, sportIdx: 0, typeIdx: 1, vendorIdx: 1, tags: ['t-shirt', 'atomicrush', 'sportswear'] },
    { name: 'FusionTrack Pants', price: 62.99, discountPrice: null, brandIdx: 1, sportIdx: 0, typeIdx: 4, vendorIdx: 1, tags: ['track-pants', 'atomicrush', 'sportswear'] },
    // Zero Gravity
    { name: 'GravityX Jersey', price: 34.99, discountPrice: null, brandIdx: 2, sportIdx: 0, typeIdx: 2, vendorIdx: 2, tags: ['jersey', 'zerogravity', 'sportswear'], isTrending: true },
    { name: 'Orbit Performance Tee', price: 29.99, discountPrice: 24.99, brandIdx: 2, sportIdx: 0, typeIdx: 1, vendorIdx: 2, tags: ['t-shirt', 'zerogravity', 'sportswear'], isFeatured: true },
    { name: 'LunarFlex Shorts', price: 35.99, discountPrice: null, brandIdx: 2, sportIdx: 0, typeIdx: 3, vendorIdx: 2, tags: ['shorts', 'zerogravity', 'sportswear'] },
    { name: 'ZeroPoint Training Jersey', price: 40.99, discountPrice: null, brandIdx: 2, sportIdx: 5, typeIdx: 2, vendorIdx: 2, tags: ['jersey', 'zerogravity', 'sportswear'] },
    { name: 'AstroRun Track Jacket', price: 92.99, discountPrice: 87.99, brandIdx: 2, sportIdx: 0, typeIdx: 6, vendorIdx: 2, tags: ['track-jacket', 'zerogravity', 'sportswear'] },
    { name: 'OrbitCore Running Tee', price: 27.99, discountPrice: null, brandIdx: 2, sportIdx: 0, typeIdx: 1, vendorIdx: 2, tags: ['t-shirt', 'zerogravity', 'sportswear'], isTrending: true },
    { name: 'Eclipse Performance Shorts', price: 33.99, discountPrice: null, brandIdx: 2, sportIdx: 0, typeIdx: 3, vendorIdx: 2, tags: ['shorts', 'zerogravity', 'sportswear'] },
    { name: 'CosmicFlex Jersey', price: 38.99, discountPrice: 33.99, brandIdx: 2, sportIdx: 0, typeIdx: 2, vendorIdx: 2, tags: ['jersey', 'zerogravity', 'sportswear'] },
    { name: 'MoonForce Training Set', price: 95.99, discountPrice: null, brandIdx: 2, sportIdx: 5, typeIdx: 7, vendorIdx: 2, tags: ['training-set', 'zerogravity', 'sportswear'], isFeatured: true },
    { name: 'SkyRush Windbreaker', price: 72.99, discountPrice: null, brandIdx: 2, sportIdx: 0, typeIdx: 6, vendorIdx: 2, tags: ['windbreaker', 'zerogravity', 'sportswear'] },
    { name: 'GravityCore Track Pants', price: 54.99, discountPrice: 49.99, brandIdx: 2, sportIdx: 0, typeIdx: 4, vendorIdx: 2, tags: ['track-pants', 'zerogravity', 'sportswear'], isTrending: true },
    // CosmoDrive
    { name: 'Cosmo Sprint Jersey', price: 36.99, discountPrice: null, brandIdx: 3, sportIdx: 0, typeIdx: 2, vendorIdx: 3, tags: ['jersey', 'cosmodrive', 'sportswear'] },
    { name: 'StarForce Performance Tee', price: 31.99, discountPrice: null, brandIdx: 3, sportIdx: 0, typeIdx: 1, vendorIdx: 3, tags: ['t-shirt', 'cosmodrive', 'sportswear'] },
    { name: 'AstroFlex Shorts', price: 37.99, discountPrice: 32.99, brandIdx: 3, sportIdx: 0, typeIdx: 3, vendorIdx: 3, tags: ['shorts', 'cosmodrive', 'sportswear'] },
    { name: 'Galaxy Pro Jersey', price: 42.99, discountPrice: null, brandIdx: 3, sportIdx: 0, typeIdx: 2, vendorIdx: 3, tags: ['jersey', 'cosmodrive', 'sportswear'] },
    { name: 'CosmicRun Training Tee', price: 27.99, discountPrice: null, brandIdx: 3, sportIdx: 5, typeIdx: 1, vendorIdx: 3, tags: ['t-shirt', 'cosmodrive', 'sportswear'], isFeatured: true, isTrending: true },
    { name: 'OrbitDrive Track Jacket', price: 86.99, discountPrice: 81.99, brandIdx: 3, sportIdx: 0, typeIdx: 6, vendorIdx: 3, tags: ['track-jacket', 'cosmodrive', 'sportswear'] },
    // Krabby Run
    { name: 'Reef Runner Jersey', price: 38.99, discountPrice: null, brandIdx: 4, sportIdx: 0, typeIdx: 2, vendorIdx: 4, tags: ['jersey', 'krabbyrun', 'sportswear'] },
    { name: 'JellyRush Performance Tee', price: 33.99, discountPrice: null, brandIdx: 4, sportIdx: 0, typeIdx: 1, vendorIdx: 4, tags: ['t-shirt', 'krabbyrun', 'sportswear'] },
    { name: 'OceanFlex Shorts', price: 39.99, discountPrice: 34.99, brandIdx: 4, sportIdx: 0, typeIdx: 3, vendorIdx: 4, tags: ['shorts', 'krabbyrun', 'sportswear'] },
    { name: 'CoralCore Jersey', price: 34.99, discountPrice: null, brandIdx: 4, sportIdx: 0, typeIdx: 2, vendorIdx: 4, tags: ['jersey', 'krabbyrun', 'sportswear'], isTrending: true },
    { name: 'Tidal Sprint Training Tee', price: 29.99, discountPrice: null, brandIdx: 4, sportIdx: 5, typeIdx: 1, vendorIdx: 4, tags: ['t-shirt', 'krabbyrun', 'sportswear'] },
    { name: 'BubbleRush Running Jacket', price: 78.99, discountPrice: 73.99, brandIdx: 4, sportIdx: 0, typeIdx: 6, vendorIdx: 4, tags: ['running-jacket', 'krabbyrun', 'sportswear'], isFeatured: true },
    { name: 'DeepSea Pro Shorts', price: 37.99, discountPrice: null, brandIdx: 4, sportIdx: 0, typeIdx: 3, vendorIdx: 4, tags: ['shorts', 'krabbyrun', 'sportswear'] },
    { name: 'AquaForce Jersey', price: 42.99, discountPrice: null, brandIdx: 4, sportIdx: 0, typeIdx: 2, vendorIdx: 4, tags: ['jersey', 'krabbyrun', 'sportswear'] },
    { name: 'WaveCore Training Set', price: 89.99, discountPrice: 84.99, brandIdx: 4, sportIdx: 5, typeIdx: 7, vendorIdx: 4, tags: ['training-set', 'krabbyrun', 'sportswear'], isTrending: true },
    { name: 'SeaSprint Windbreaker', price: 66.99, discountPrice: null, brandIdx: 4, sportIdx: 0, typeIdx: 6, vendorIdx: 4, tags: ['windbreaker', 'krabbyrun', 'sportswear'] },
    { name: 'ReefFlex Track Pants', price: 58.99, discountPrice: null, brandIdx: 4, sportIdx: 0, typeIdx: 4, vendorIdx: 4, tags: ['track-pants', 'krabbyrun', 'sportswear'] },
    { name: 'TideForce Performance Tee', price: 33.99, discountPrice: 28.99, brandIdx: 4, sportIdx: 0, typeIdx: 1, vendorIdx: 4, tags: ['t-shirt', 'krabbyrun', 'sportswear'] },
    { name: 'CoralRush Running Shorts', price: 37.99, discountPrice: null, brandIdx: 4, sportIdx: 0, typeIdx: 3, vendorIdx: 4, tags: ['running-shorts', 'krabbyrun', 'sportswear'], isFeatured: true },
    { name: 'OceanDrive Jersey', price: 34.99, discountPrice: null, brandIdx: 4, sportIdx: 0, typeIdx: 2, vendorIdx: 4, tags: ['jersey', 'krabbyrun', 'sportswear'], isTrending: true },
    { name: 'BubbleCore Training Tee', price: 29.99, discountPrice: 24.99, brandIdx: 4, sportIdx: 5, typeIdx: 1, vendorIdx: 4, tags: ['t-shirt', 'krabbyrun', 'sportswear'] },
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const slug = p.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: `${p.name} — designed for athletes who demand quality and performance. Built with premium materials and engineered for durability.`,
        shortDescription: p.name,
        price: p.price,
        discountPrice: p.discountPrice,
        sku: `SKU-${String(i + 1).padStart(4, '0')}`,
        brandId: brands[p.brandIdx].id,
        sportCategoryId: sports[p.sportIdx].id,
        productTypeId: productTypes[p.typeIdx].id,
        vendorId: vendors[p.vendorIdx].id,
        status: ProductStatus.ACTIVE,
        isFeatured: p.isFeatured ?? false,
        isNewArrival: p.isNewArrival ?? i < 10,
        isTrending: p.isTrending ?? false,
        tags: p.tags,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 50) + 5,
        salesCount: Math.floor(Math.random() * 200) + 20,
        variants: {
          create: apparelSizes.slice(0, 4).map((size, vi) => ({
            color: colors[vi % colors.length],
            size,
            sku: `SKU-${String(i + 1).padStart(4, '0')}-${vi}`,
            stock: Math.floor(Math.random() * 20) + 5,
          })),
        },
        images: {
          create: [0, 1, 2].map((imgIdx) => ({
            url: img(imgIdx === 0 ? slug : `${slug}-${imgIdx + 1}`),
            alt: `${p.name} - view ${imgIdx + 1}`,
            isPrimary: imgIdx === 0,
            sortOrder: imgIdx,
          })),
        },
      },
    });
  }

  console.log(`Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
