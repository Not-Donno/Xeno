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

// Real product photos from Unsplash
function img(id: string, w = 800, h = 800): string {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;
}

async function main() {
  console.log('Seeding database...');

  // Clean existing data (order matters for FK constraints)
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
        email: 'nike@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Nike',
        lastName: 'Team',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'adidas@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Adidas',
        lastName: 'Team',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'puma@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Puma',
        lastName: 'Team',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'underarmour@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Under',
        lastName: 'Armour',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'newbalance@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'New',
        lastName: 'Balance',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'reebok@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Reebok',
        lastName: 'Team',
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
  // VENDORS - Real sports brands
  // ============================================================
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        userId: vendorUsers[0].id,
        slug: 'nike',
        name: 'Nike',
        description:
          'Nike, Inc. is an American multinational corporation that is engaged in the design, development, manufacturing, and worldwide marketing and sales of footwear, apparel, equipment, accessories, and services.',
        logoUrl: img('photo-1542291026-7eec264c27ff', 200, 200),
        bannerUrl: img('photo-1556906781-9a412961c28c', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.8,
        totalSales: 15420,
        socialLinks: {
          website: 'https://www.nike.com',
          instagram: '@nike',
          twitter: '@nike',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[1].id,
        slug: 'adidas',
        name: 'Adidas',
        description:
          'Adidas AG is a German multinational corporation, founded and headquartered in Herzogenaurach, Germany. It designs and manufactures shoes, clothing and accessories.',
        logoUrl: img('photo-1608231387042-66d1773070a5', 200, 200),
        bannerUrl: img('photo-1606107557195-0e29a4b5b4aa', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.7,
        totalSales: 12850,
        socialLinks: {
          website: 'https://www.adidas.com',
          instagram: '@adidas',
          twitter: '@adidas',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[2].id,
        slug: 'puma',
        name: 'Puma',
        description:
          'PUMA SE is a German multinational corporation that designs and manufactures athletic and casual footwear, apparel and accessories, headquartered in Herzogenaurach, Germany.',
        logoUrl: img('photo-1608234807905-4466023792f5', 200, 200),
        bannerUrl: img('photo-1605348532760-6753d2c43329', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.5,
        totalSales: 8920,
        socialLinks: {
          website: 'https://www.puma.com',
          instagram: '@puma',
          twitter: '@puma',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[3].id,
        slug: 'under-armour',
        name: 'Under Armour',
        description:
          'Under Armour, Inc. is an American company that manufactures footwear, sports and casual apparel. It was founded in 1996 and is headquartered in Baltimore, Maryland.',
        logoUrl: img('photo-1612892483236-5245769ee88d', 200, 200),
        bannerUrl: img('photo-1571019613454-1cb2f99b2d8b', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.4,
        totalSales: 7650,
        socialLinks: {
          website: 'https://www.underarmour.com',
          instagram: '@underarmour',
          twitter: '@underarmour',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[4].id,
        slug: 'new-balance',
        name: 'New Balance',
        description:
          'New Balance Athletics, Inc. is an American multinational corporation that designs and manufactures athletic footwear and apparel. It was founded in 1906 and is headquartered in Boston, Massachusetts.',
        logoUrl: img('photo-1539185441755-769473a23570', 200, 200),
        bannerUrl: img('photo-1595950653106-6c9ebd614d3a', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.6,
        totalSales: 6340,
        socialLinks: {
          website: 'https://www.newbalance.com',
          instagram: '@newbalance',
          twitter: '@newbalance',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[5].id,
        slug: 'reebok',
        name: 'Reebok',
        description:
          'Reebok is an American-inspired global brand with a deep fitness heritage and a clear mission: to be the best fitness brand in the world. Founded in 1958, it is now part of the Adidas Group.',
        logoUrl: img('photo-1600185365483-26d7a4cc7519', 200, 200),
        bannerUrl: img('photo-1517836357463-d25dfeac3438', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.3,
        totalSales: 5210,
        socialLinks: {
          website: 'https://www.reebok.com',
          instagram: '@reebok',
          twitter: '@reebok',
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
    prisma.category.create({ data: { name: 'Hoodies', slug: 'hoodies', type: CategoryType.PRODUCT_TYPE, icon: 'jacket', description: 'Hoodies and sweatshirts', sortOrder: 6 } }),
    prisma.category.create({ data: { name: 'Jackets', slug: 'jackets', type: CategoryType.PRODUCT_TYPE, icon: 'jacket', description: 'Sports jackets and windbreakers', sortOrder: 7 } }),
    prisma.category.create({ data: { name: 'Tracksuits', slug: 'tracksuits', type: CategoryType.PRODUCT_TYPE, icon: 'runner', description: 'Matching tracksuit sets', sortOrder: 8 } }),
    prisma.category.create({ data: { name: 'Socks', slug: 'socks', type: CategoryType.PRODUCT_TYPE, icon: 'socks', description: 'Athletic socks', sortOrder: 9 } }),
    prisma.category.create({ data: { name: 'Caps', slug: 'caps', type: CategoryType.PRODUCT_TYPE, icon: 'cap', description: 'Caps, visors and headwear', sortOrder: 10 } }),
    prisma.category.create({ data: { name: 'Bags', slug: 'bags', type: CategoryType.PRODUCT_TYPE, icon: 'bag', description: 'Sports bags and backpacks', sortOrder: 11 } }),
    prisma.category.create({ data: { name: 'Accessories', slug: 'accessories', type: CategoryType.PRODUCT_TYPE, icon: 'watch', description: 'Sports accessories', sortOrder: 12 } }),
    prisma.category.create({ data: { name: 'Equipment', slug: 'equipment', type: CategoryType.PRODUCT_TYPE, icon: 'volleyball', description: 'Sports equipment', sortOrder: 13 } }),
  ]);

  // ============================================================
  // BRANDS
  // ============================================================
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'Nike', slug: 'nike' } }),
    prisma.brand.create({ data: { name: 'Adidas', slug: 'adidas' } }),
    prisma.brand.create({ data: { name: 'Puma', slug: 'puma' } }),
    prisma.brand.create({ data: { name: 'Under Armour', slug: 'under-armour' } }),
    prisma.brand.create({ data: { name: 'New Balance', slug: 'new-balance' } }),
    prisma.brand.create({ data: { name: 'Reebok', slug: 'reebok' } }),
  ]);

  // ============================================================
  // PRODUCTS - Real products with real photos
  // ============================================================
  const shoeSizes = ['7', '8', '9', '10', '11', '12'];
  const apparelSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Grey'];

  interface ProductSeed {
    name: string;
    description: string;
    shortDescription: string;
    price: number;
    discountPrice: number | null;
    brandIdx: number;
    sportIdx: number;
    typeIdx: number;
    vendorIdx: number;
    tags: string[];
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isTrending?: boolean;
    imageIds: string[];
    variants: { color: string; size: string; stock: number }[];
  }

  const products: ProductSeed[] = [
    // Nike Running Shoes
    {
      name: 'Nike Air Zoom Pegasus 40',
      description: 'The Nike Air Zoom Pegasus 40 is a versatile running shoe with responsive cushioning and a breathable mesh upper. Perfect for daily training and long runs. Features Zoom Air units in the forefoot and heel for responsive cushioning.',
      shortDescription: 'Versatile running shoe with responsive cushioning',
      price: 129.99,
      discountPrice: 99.99,
      brandIdx: 0,
      sportIdx: 0,
      typeIdx: 0,
      vendorIdx: 0,
      tags: ['running', 'shoes', 'nike', 'pegasus'],
      isFeatured: true,
      isTrending: true,
      imageIds: ['photo-1542291026-7eec264c27ff', 'photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519'],
      variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 20) + 5 }))),
    },
    {
      name: 'Nike Air Force 1 \'07',
      description: 'The Nike Air Force 1 \'07 is a classic basketball shoe with timeless style. Premium leather and Air cushioning make it a staple for any sneaker collection.',
      shortDescription: 'Classic basketball shoe with Air cushioning',
      price: 109.99,
      discountPrice: null,
      brandIdx: 0,
      sportIdx: 2,
      typeIdx: 0,
      vendorIdx: 0,
      tags: ['basketball', 'shoes', 'nike', 'air-force'],
      isTrending: true,
      imageIds: ['photo-1595950653106-6c9ebd614d3a', 'photo-1600269452121-4f2416e55c28', 'photo-1608231387042-66d1773070a5'],
      variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 20) + 5 }))),
    },
    {
      name: 'Nike Mercurial Vapor 15 Elite',
      description: 'The Nike Mercurial Vapor 15 Elite is built for speed with a lightweight Flyknit upper and responsive Zoom Air unit. Designed for elite players who demand the best.',
      shortDescription: 'Lightweight speed boot for elite players',
      price: 274.99,
      discountPrice: 229.99,
      brandIdx: 0,
      sportIdx: 1,
      typeIdx: 0,
      vendorIdx: 0,
      tags: ['football', 'boots', 'nike', 'mercurial'],
      isFeatured: true,
      isTrending: true,
      imageIds: ['photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519', 'photo-1595950653106-6c9ebd614d3a'],
      variants: shoeSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 15) + 3 }))),
    },
    {
      name: 'Nike Dri-FIT Academy T-Shirt',
      description: 'The Nike Dri-FIT Academy T-Shirt keeps you dry during intense training sessions. Lightweight and breathable fabric with a comfortable fit.',
      shortDescription: 'Dri-FIT training t-shirt',
      price: 29.99,
      discountPrice: null,
      brandIdx: 0,
      sportIdx: 5,
      typeIdx: 1,
      vendorIdx: 0,
      tags: ['t-shirt', 'training', 'nike', 'dri-fit'],
      imageIds: ['photo-1521572163474-6864f9cf17ab', 'photo-1581655353564-df123a1eb820', 'photo-1576566588028-4147f3842f27'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 4).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 40) + 15 }))),
    },
    {
      name: 'Nike Sportswear Club Fleece Pullover Hoodie',
      description: 'The Nike Sportswear Club Fleece Pullover Hoodie is a wardrobe essential. Soft fleece with a relaxed fit for everyday comfort.',
      shortDescription: 'Soft fleece pullover hoodie',
      price: 59.99,
      discountPrice: 44.99,
      brandIdx: 0,
      sportIdx: 5,
      typeIdx: 5,
      vendorIdx: 0,
      tags: ['hoodie', 'nike', 'fleece', 'casual'],
      isTrending: true,
      imageIds: ['photo-1556821840-3a63f95609a7', 'photo-1578768079052-aa7c55954dc5', 'photo-1618354691373-d851c5c3a990'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 4).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 30) + 10 }))),
    },
    {
      name: 'Nike Academy Woven Shorts',
      description: 'The Nike Academy Woven Shorts are lightweight and breathable for training. Elastic waistband with drawcord for a secure fit.',
      shortDescription: 'Lightweight training shorts',
      price: 39.99,
      discountPrice: null,
      brandIdx: 0,
      sportIdx: 1,
      typeIdx: 3,
      vendorIdx: 0,
      tags: ['shorts', 'nike', 'academy'],
      imageIds: ['photo-1591195853828-11db59a44f6b', 'photo-1571945153237-4929e783af4a', 'photo-1552902865-b72c031ac5ea'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 30) + 10 }))),
    },
    {
      name: 'Nike Everyday Cushioned Training Socks 3-Pack',
      description: 'The Nike Everyday Cushioned Training Socks 3-Pack provides comfort and support for daily training. Moisture-wicking fabric keeps feet dry.',
      shortDescription: '3-pack training socks',
      price: 16.99,
      discountPrice: 12.99,
      brandIdx: 0,
      sportIdx: 5,
      typeIdx: 8,
      vendorIdx: 0,
      tags: ['socks', 'nike', 'training', '3-pack'],
      imageIds: ['photo-1586350977771-b3b95a03628e', 'photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519'],
      variants: [{ color: 'White', size: 'M', stock: 120 }, { color: 'Black', size: 'M', stock: 100 }, { color: 'White', size: 'L', stock: 110 }, { color: 'Black', size: 'L', stock: 90 }],
    },
    {
      name: 'Nike Dri-FIT Swoosh Cap',
      description: 'The Nike Dri-FIT Swoosh Cap features moisture-wicking fabric and adjustable fit for all-day comfort.',
      shortDescription: 'Moisture-wicking adjustable cap',
      price: 27.99,
      discountPrice: null,
      brandIdx: 0,
      sportIdx: 5,
      typeIdx: 9,
      vendorIdx: 0,
      tags: ['cap', 'nike', 'dri-fit'],
      imageIds: ['photo-1588850561407-ed78c282e89b', 'photo-1521369909029-2afed882baee', 'photo-1534215754734-18e55d13e346'],
      variants: [{ color: 'Black', size: 'One Size', stock: 60 }, { color: 'White', size: 'One Size', stock: 50 }, { color: 'Navy', size: 'One Size', stock: 40 }],
    },

    // Adidas Products
    {
      name: 'Adidas Ultraboost 23',
      description: 'The Adidas Ultraboost 23 features Primeknit upper and Boost midsole for incredible energy return. A premium running shoe for serious athletes.',
      shortDescription: 'Premium running shoe with Boost technology',
      price: 189.99,
      discountPrice: null,
      brandIdx: 1,
      sportIdx: 0,
      typeIdx: 0,
      vendorIdx: 1,
      tags: ['running', 'shoes', 'adidas', 'ultraboost'],
      isFeatured: true,
      imageIds: ['photo-1608231387042-66d1773070a5', 'photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519'],
      variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 15) + 3 }))),
    },
    {
      name: 'Adidas Copa Pure 2 Elite',
      description: 'The Adidas Copa Pure 2 Elite features premium K-leather upper for ultimate touch and comfort. A classic football boot reimagined for the modern game.',
      shortDescription: 'Premium leather football boot',
      price: 279.99,
      discountPrice: null,
      brandIdx: 1,
      sportIdx: 1,
      typeIdx: 0,
      vendorIdx: 1,
      tags: ['football', 'boots', 'adidas', 'copa'],
      imageIds: ['photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519', 'photo-1595950653106-6c9ebd614d3a'],
      variants: shoeSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 12) + 2 }))),
    },
    {
      name: 'Adidas Tiro 24 Training Jacket',
      description: 'The Adidas Tiro 24 Training Jacket offers warmth and mobility for cold-weather training. Slim fit with AEROREADY technology.',
      shortDescription: 'Warm training jacket for cold weather',
      price: 59.99,
      discountPrice: 49.99,
      brandIdx: 1,
      sportIdx: 1,
      typeIdx: 6,
      vendorIdx: 1,
      tags: ['jacket', 'adidas', 'tiro', 'training'],
      imageIds: ['photo-1551028719-00167b16eac5', 'photo-1591047139829-d91aecb6caea', 'photo-1578768079052-aa7c55954dc5'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 18) + 4 }))),
    },
    {
      name: 'Adidas Own The Run Tee',
      description: 'The Adidas Own The Run Tee features AEROREADY technology for moisture management during workouts. Lightweight and breathable.',
      shortDescription: 'AEROREADY running tee',
      price: 29.99,
      discountPrice: 24.99,
      brandIdx: 1,
      sportIdx: 0,
      typeIdx: 1,
      vendorIdx: 1,
      tags: ['t-shirt', 'running', 'adidas'],
      imageIds: ['photo-1581655353564-df123a1eb820', 'photo-1576566588028-4147f3842f27', 'photo-1521572163474-6864f9cf17ab'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 35) + 10 }))),
    },
    {
      name: 'Adidas Tastigo 24 Shorts',
      description: 'The Adidas Tastigo 24 Shorts are lightweight and breathable for training. AEROREADY fabric keeps you dry.',
      shortDescription: 'Lightweight training shorts',
      price: 29.99,
      discountPrice: 24.99,
      brandIdx: 1,
      sportIdx: 1,
      typeIdx: 3,
      vendorIdx: 1,
      tags: ['shorts', 'adidas', 'tastigo'],
      imageIds: ['photo-1591195853828-11db59a44f6b', 'photo-1571945153237-4929e783af4a', 'photo-1552902865-b72c031ac5ea'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 35) + 12 }))),
    },
    {
      name: 'Adidas Defender IV Duffel Bag',
      description: 'The Adidas Defender IV Duffel Bag offers spacious storage with durable construction. Ventilated shoe compartment keeps gear separate.',
      shortDescription: 'Spacious duffel with shoe compartment',
      price: 39.99,
      discountPrice: 29.99,
      brandIdx: 1,
      sportIdx: 5,
      typeIdx: 10,
      vendorIdx: 1,
      tags: ['bag', 'adidas', 'duffel', 'defender'],
      imageIds: ['photo-1553062407-98eeb64c6a62', 'photo-1547949003-9792a18a2601', 'photo-1571019613454-1cb2f99b2d8b'],
      variants: [{ color: 'Black', size: 'One Size', stock: 55 }, { color: 'Grey', size: 'One Size', stock: 35 }],
    },

    // Puma Products
    {
      name: 'Puma Future 7 Play',
      description: 'The Puma Future 7 Play offers adaptive fit for creative players. FUZIONFIT360 upper provides lockdown and agility on the pitch.',
      shortDescription: 'Adaptive fit for creative players',
      price: 129.99,
      discountPrice: 99.99,
      brandIdx: 2,
      sportIdx: 1,
      typeIdx: 0,
      vendorIdx: 2,
      tags: ['football', 'boots', 'puma', 'future'],
      imageIds: ['photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519', 'photo-1595950653106-6c9ebd614d3a'],
      variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 18) + 5 }))),
    },
    {
      name: 'Puma Essentials Logo Hoodie',
      description: 'The Puma Essentials Logo Hoodie offers everyday comfort with a classic look. Soft cotton blend fleece for warmth.',
      shortDescription: 'Everyday comfort hoodie',
      price: 49.99,
      discountPrice: 39.99,
      brandIdx: 2,
      sportIdx: 5,
      typeIdx: 5,
      vendorIdx: 2,
      tags: ['hoodie', 'puma', 'essentials'],
      imageIds: ['photo-1556821840-3a63f95609a7', 'photo-1578768079052-aa7c55954dc5', 'photo-1618354691373-d851c5c3a990'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 22) + 7 }))),
    },
    {
      name: 'Puma evoKNIT Shorts',
      description: 'The Puma evoKNIT Shorts offer a seamless fit for unrestricted movement. Lightweight and breathable for intense training.',
      shortDescription: 'Seamless training shorts',
      price: 34.99,
      discountPrice: 27.99,
      brandIdx: 2,
      sportIdx: 5,
      typeIdx: 3,
      vendorIdx: 2,
      tags: ['shorts', 'puma', 'evoknit', 'training'],
      imageIds: ['photo-1591195853828-11db59a44f6b', 'photo-1571945153237-4929e783af4a', 'photo-1552902865-b72c031ac5ea'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 22) + 6 }))),
    },

    // Under Armour Products
    {
      name: 'UA Charged Assert 10',
      description: 'The Under Armour Charged Assert 10 offers responsive cushioning for everyday running. Durable leather upper provides stability.',
      shortDescription: 'Responsive cushioning for everyday running',
      price: 74.99,
      discountPrice: 59.99,
      brandIdx: 3,
      sportIdx: 0,
      typeIdx: 0,
      vendorIdx: 3,
      tags: ['running', 'shoes', 'under-armour', 'charged'],
      imageIds: ['photo-1542291026-7eec264c27ff', 'photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519'],
      variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 25) + 8 }))),
    },
    {
      name: 'UA Tech 2.0 Short Sleeve',
      description: 'The Under Armour Tech 2.0 Short Sleeve is soft, light, and quick-drying. Perfect for training and everyday wear.',
      shortDescription: 'Soft, light, quick-drying training tee',
      price: 24.99,
      discountPrice: 19.99,
      brandIdx: 3,
      sportIdx: 5,
      typeIdx: 1,
      vendorIdx: 3,
      tags: ['t-shirt', 'training', 'under-armour'],
      imageIds: ['photo-1581655353564-df123a1eb820', 'photo-1576566588028-4147f3842f27', 'photo-1521572163474-6864f9cf17ab'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 4).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 45) + 18 }))),
    },
    {
      name: 'UA Rival Fleece Full-Zip Hoodie',
      description: 'The Under Armour Rival Fleece Full-Zip Hoodie offers versatile warmth for training and casual wear. Soft fleece interior.',
      shortDescription: 'Versatile full-zip fleece hoodie',
      price: 54.99,
      discountPrice: 44.99,
      brandIdx: 3,
      sportIdx: 5,
      typeIdx: 5,
      vendorIdx: 3,
      tags: ['hoodie', 'under-armour', 'fleece'],
      imageIds: ['photo-1556821840-3a63f95609a7', 'photo-1578768079052-aa7c55954dc5', 'photo-1618354691373-d851c5c3a990'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 28) + 9 }))),
    },
    {
      name: 'UA Baseline Basketball Shorts',
      description: 'The Under Armour Baseline Basketball Shorts offer lightweight comfort on the court. HeatGear fabric keeps you cool.',
      shortDescription: 'Lightweight basketball shorts',
      price: 34.99,
      discountPrice: null,
      brandIdx: 3,
      sportIdx: 2,
      typeIdx: 3,
      vendorIdx: 3,
      tags: ['basketball', 'shorts', 'under-armour'],
      imageIds: ['photo-1591195853828-11db59a44f6b', 'photo-1571945153237-4929e783af4a', 'photo-1552902865-b72c031ac5ea'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 35) + 12 }))),
    },

    // New Balance Products
    {
      name: 'New Balance Fresh Foam 1080v13',
      description: 'The New Balance Fresh Foam 1080v13 delivers plush comfort for neutral runners. Fresh Foam X cushioning provides a smooth, soft ride.',
      shortDescription: 'Plush comfort for neutral runners',
      price: 164.99,
      discountPrice: null,
      brandIdx: 4,
      sportIdx: 0,
      typeIdx: 0,
      vendorIdx: 4,
      tags: ['running', 'shoes', 'new-balance', 'fresh-foam'],
      imageIds: ['photo-1539185441755-769473a23570', 'photo-1595950653106-6c9ebd614d3a', 'photo-1606107557195-0e29a4b5b4aa'],
      variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 18) + 4 }))),
    },
    {
      name: 'New Balance Sport Style Hoodie',
      description: 'The New Balance Sport Style Hoodie combines comfort and style. Soft fleece with a modern athletic fit.',
      shortDescription: 'Comfortable sport style hoodie',
      price: 54.99,
      discountPrice: 44.99,
      brandIdx: 4,
      sportIdx: 5,
      typeIdx: 5,
      vendorIdx: 4,
      tags: ['hoodie', 'new-balance', 'sport'],
      imageIds: ['photo-1556821840-3a63f95609a7', 'photo-1578768079052-aa7c55954dc5', 'photo-1618354691373-d851c5c3a990'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 25) + 8 }))),
    },

    // Reebok Products
    {
      name: 'Reebok Nano X3',
      description: 'The Reebok Nano X3 is the ultimate training shoe. Built for CrossFit and high-intensity workouts with responsive cushioning.',
      shortDescription: 'Ultimate training shoe for CrossFit',
      price: 149.99,
      discountPrice: 119.99,
      brandIdx: 5,
      sportIdx: 4,
      typeIdx: 0,
      vendorIdx: 5,
      tags: ['training', 'shoes', 'reebok', 'nano'],
      imageIds: ['photo-1542291026-7eec264c27ff', 'photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519'],
      variants: shoeSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 15) + 3 }))),
    },
    {
      name: 'Reebok Classic Leather',
      description: 'The Reebok Classic Leather is a timeless icon. Soft leather upper with a comfortable EVA midsole.',
      shortDescription: 'Timeless classic leather sneaker',
      price: 74.99,
      discountPrice: 59.99,
      brandIdx: 5,
      sportIdx: 5,
      typeIdx: 0,
      vendorIdx: 5,
      tags: ['casual', 'shoes', 'reebok', 'classic'],
      imageIds: ['photo-1595950653106-6c9ebd614d3a', 'photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519'],
      variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 20) + 5 }))),
    },
    {
      name: 'Reebok Training T-Shirt',
      description: 'The Reebok Training T-Shirt is designed for intense workouts. Lightweight and breathable with a comfortable fit.',
      shortDescription: 'Lightweight training t-shirt',
      price: 24.99,
      discountPrice: 19.99,
      brandIdx: 5,
      sportIdx: 5,
      typeIdx: 1,
      vendorIdx: 5,
      tags: ['t-shirt', 'training', 'reebok'],
      imageIds: ['photo-1581655353564-df123a1eb820', 'photo-1576566588028-4147f3842f27', 'photo-1521572163474-6864f9cf17ab'],
      variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 30) + 10 }))),
    },

    // Equipment
    {
      name: 'Nike Strike Team Football',
      description: 'The Nike Strike Team Football is built for practice and match play. Durable construction with excellent flight stability.',
      shortDescription: 'Durable practice and match football',
      price: 29.99,
      discountPrice: 24.99,
      brandIdx: 0,
      sportIdx: 1,
      typeIdx: 12,
      vendorIdx: 0,
      tags: ['football', 'ball', 'nike', 'strike'],
      imageIds: ['photo-1579952363873-27f3b990ef6b', 'photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519'],
      variants: [{ color: 'White', size: '5', stock: 50 }, { color: 'Yellow', size: '5', stock: 30 }],
    },
    {
      name: 'Adidas Tiro 24 Training Ball',
      description: 'The Adidas Tiro 24 Training Ball is designed for consistent flight and durability on all surfaces.',
      shortDescription: 'Durable training ball',
      price: 24.99,
      discountPrice: 19.99,
      brandIdx: 1,
      sportIdx: 1,
      typeIdx: 12,
      vendorIdx: 1,
      tags: ['football', 'ball', 'adidas', 'training'],
      imageIds: ['photo-1579952363873-27f3b990ef6b', 'photo-1606107557195-0e29a4b5b4aa', 'photo-1600185365483-26d7a4cc7519'],
      variants: [{ color: 'White', size: '5', stock: 60 }, { color: 'Orange', size: '5', stock: 40 }],
    },
  ];

  // Create products with variants and images
  const createdProducts: any[] = [];
  const usedSlugs = new Set<string>();
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let slug = p.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
    // Handle duplicate slugs
    let slugSuffix = 1;
    let originalSlug = slug;
    while (usedSlugs.has(slug)) {
      slug = `${originalSlug}-${slugSuffix}`;
      slugSuffix++;
    }
    usedSlugs.add(slug);

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        shortDescription: p.shortDescription,
        price: p.price,
        discountPrice: p.discountPrice,
        sku: `SKU-${String(i + 1).padStart(4, '0')}`,
        brandId: brands[p.brandIdx].id,
        sportCategoryId: sports[p.sportIdx].id,
        productTypeId: productTypes[p.typeIdx].id,
        vendorId: vendors[p.vendorIdx].id,
        status: ProductStatus.ACTIVE,
        isFeatured: p.isFeatured ?? false,
        isNewArrival: p.isNewArrival ?? i < 8,
        isTrending: p.isTrending ?? false,
        tags: p.tags,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 50) + 5,
        salesCount: Math.floor(Math.random() * 200) + 20,
        variants: {
          create: p.variants.map((v, vi) => ({
            color: v.color,
            size: v.size,
            sku: `SKU-${String(i + 1).padStart(4, '0')}-${vi}`,
            stock: v.stock,
          })),
        },
        images: {
          create: p.imageIds.map((imgId, imgIdx) => ({
            url: img(imgId),
            alt: `${p.name} - view ${imgIdx + 1}`,
            isPrimary: imgIdx === 0,
            sortOrder: imgIdx,
          })),
        },
      },
      include: {
        variants: true,
      },
    });
    createdProducts.push(product);
  }

  // ============================================================
  // REVIEWS
  // ============================================================
  const reviewBodies = [
    { rating: 5, title: 'Excellent quality', body: 'Exceeded my expectations. The quality is outstanding and it fits perfectly. Highly recommend!' },
    { rating: 4, title: 'Very good', body: 'Great product overall. Comfortable and well-made. Took off one star because shipping was a bit slow.' },
    { rating: 5, title: 'Perfect for training', body: 'I use this for daily training sessions. It holds up really well and performs exactly as described.' },
    { rating: 4, title: 'Good value', body: 'Solid product for the price. Would buy again. The sizing runs slightly small so consider ordering half a size up.' },
    { rating: 5, title: 'Love it', body: 'This is my second purchase. The first one lasted over a year of regular use. Great durability and comfort.' },
    { rating: 3, title: 'Decent', body: 'It is okay for the price. Not the best quality I have had but acceptable for casual use.' },
    { rating: 5, title: 'Highly recommend', body: 'Bought this for my son and he absolutely loves it. Great quality and fast delivery.' },
    { rating: 4, title: 'Solid purchase', body: 'Does what it needs to do. Comfortable fit and good materials. Would recommend for the price point.' },
  ];

  // Create reviews for first 12 products from customers
  for (let i = 0; i < Math.min(12, createdProducts.length); i++) {
    const product = createdProducts[i];
    const numReviews = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numReviews; j++) {
      const customer = customerUsers[Math.floor(Math.random() * customerUsers.length)];
      const reviewData = reviewBodies[Math.floor(Math.random() * reviewBodies.length)];

      // Check if review already exists
      const existing = await prisma.review.findUnique({
        where: { userId_productId: { userId: customer.id, productId: product.id } },
      });
      if (existing) continue;

      const review = await prisma.review.create({
        data: {
          productId: product.id,
          userId: customer.id,
          vendorId: product.vendorId,
          rating: reviewData.rating,
          title: reviewData.title,
          body: reviewData.body,
          status: ReviewStatus.APPROVED,
        },
      });

      // Some reviews have vendor responses
      if (Math.random() > 0.6) {
        await prisma.reviewResponse.create({
          data: {
            reviewId: review.id,
            body: 'Thank you for your feedback! We are glad you are enjoying the product. If you have any questions, feel free to reach out.',
          },
        });
      }
    }
  }

  // ============================================================
  // ORDERS (for review verification)
  // ============================================================
  const address = await prisma.address.create({
    data: {
      userId: customerUsers[0].id,
      label: 'Home',
      name: 'John Doe',
      phone: '+1-555-0123',
      line1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      isDefault: true,
    },
  });

  // Create a delivered order so john@example.com can review products
  const orderItems = createdProducts.slice(0, 3).map((p) => ({
    productId: p.id,
    variantId: p.variants[0].id,
    vendorId: p.vendorId,
    quantity: 1,
    unitPrice: p.price,
    totalPrice: p.price,
  }));

  const subtotal = orderItems.reduce((s, i) => s + i.totalPrice, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const order = await prisma.order.create({
    data: {
      orderNumber: 'XNO-SEED001',
      userId: customerUsers[0].id,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      subtotal,
      discount: 0,
      shipping,
      tax,
      total,
      shippingAddress: {
        label: 'Home',
        name: 'John Doe',
        phone: '+1-555-0123',
        line1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
      },
      paymentMethod: 'test',
      items: { create: orderItems },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: total,
      method: 'test',
      status: PaymentStatus.PAID,
      transactionId: 'test_seed_001',
    },
  });

  // ============================================================
  // PROMOTIONS
  // ============================================================
  await prisma.promotion.create({
    data: {
      title: 'Summer Sale',
      subtitle: 'Up to 30% off on selected items',
      imageUrl: img('photo-1556906781-9a412961c28c', 1200, 400),
      linkUrl: '/products?onSale=true',
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.promotion.create({
    data: {
      title: 'New Arrivals',
      subtitle: 'Check out the latest gear',
      imageUrl: img('photo-1517836357463-d25dfeac3438', 1200, 400),
      linkUrl: '/products?sort=newest',
      isActive: true,
      sortOrder: 2,
    },
  });

  await prisma.promotion.create({
    data: {
      title: 'Free Shipping',
      subtitle: 'On orders over $100',
      imageUrl: img('photo-1571019613454-1cb2f99b2d8b', 1200, 400),
      linkUrl: '/products',
      isActive: true,
      sortOrder: 3,
    },
  });

  // ============================================================
  // COUPONS
  // ============================================================
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minOrder: 50,
      maxUses: 100,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'SAVE20',
      type: 'FIXED',
      value: 20,
      minOrder: 100,
      maxUses: 50,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // ============================================================
  // SETTINGS
  // ============================================================
  await prisma.setting.create({
    data: { key: 'shipping_threshold', value: '100' },
  });
  await prisma.setting.create({
    data: { key: 'shipping_fee', value: '9.99' },
  });
  await prisma.setting.create({
    data: { key: 'tax_rate', value: '0.08' },
  });

  // ============================================================
  // NOTIFICATIONS for admin
  // ============================================================
  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: 'Welcome to Xeno',
      body: 'Your marketplace is ready. Start managing your store from the admin dashboard.',
      type: 'SYSTEM',
    },
  });

  console.log('Seed completed successfully!');
  console.log(`  Admin: admin@xeno.com / Admin123!`);
  console.log(`  Vendors: nike@xeno.com, adidas@xeno.com, puma@xeno.com, underarmour@xeno.com, newbalance@xeno.com, reebok@xeno.com / Vendor123!`);
  console.log(`  Customers: john@example.com, jane@example.com, etc. / Customer123!`);
  console.log(`  Products: ${createdProducts.length}`);
  console.log(`  Categories: ${sports.length} sports, ${productTypes.length} product types`);
  console.log(`  Brands: ${brands.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
