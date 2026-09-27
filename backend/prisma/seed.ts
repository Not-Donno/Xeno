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

// Generate a realistic placeholder image URL
function img(seed: string, w = 800, h = 800): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
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
        email: 'velocity@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Marcus',
        lastName: 'Chen',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'apex@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Sarah',
        lastName: 'Williams',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'nova@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'James',
        lastName: 'Rodriguez',
        role: Role.VENDOR,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'zenith@xeno.com',
        passwordHash: vendorPassword,
        firstName: 'Elena',
        lastName: 'Kowalski',
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
        slug: 'velocity-athletics',
        name: 'Velocity Athletics',
        description:
          'Premium running and training gear designed for athletes who demand performance. Founded in 2015, we specialize in cutting-edge footwear and apparel for serious runners.',
        logoUrl: img('velocity-logo', 200, 200),
        bannerUrl: img('velocity-banner', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.7,
        totalSales: 1250,
        socialLinks: {
          website: 'https://velocityathletics.com',
          instagram: '@velocityathletics',
          twitter: '@velocityathletics',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[1].id,
        slug: 'apex-sports',
        name: 'Apex Sports',
        description:
          'Official supplier of team sports equipment and apparel. We outfit athletes from grassroots to professional level with quality gear that lasts.',
        logoUrl: img('apex-logo', 200, 200),
        bannerUrl: img('apex-banner', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.5,
        totalSales: 980,
        socialLinks: {
          website: 'https://apexsports.com',
          facebook: 'apexsports',
          instagram: '@apexsports',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[2].id,
        slug: 'nova-performance',
        name: 'Nova Performance',
        description:
          'Innovation meets style. Nova Performance brings you the latest in sportswear technology with sustainable manufacturing practices.',
        logoUrl: img('nova-logo', 200, 200),
        bannerUrl: img('nova-banner', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.3,
        totalSales: 720,
        socialLinks: {
          website: 'https://novaperformance.com',
          instagram: '@novaperformance',
        },
      },
    }),
    prisma.vendor.create({
      data: {
        userId: vendorUsers[3].id,
        slug: 'zenith-gear',
        name: 'Zenith Gear',
        description:
          'High-performance equipment for court sports. From tennis to volleyball, we provide professional-grade gear trusted by athletes worldwide.',
        logoUrl: img('zenith-logo', 200, 200),
        bannerUrl: img('zenith-banner', 1600, 400),
        status: VendorStatus.APPROVED,
        rating: 4.6,
        totalSales: 650,
        socialLinks: {
          website: 'https://zenithgear.com',
          instagram: '@zenithgear',
        },
      },
    }),
  ]);

  // ============================================================
  // CATEGORIES - Sports
  // ============================================================
  const sports = await Promise.all([
    prisma.category.create({ data: { name: 'Running', slug: 'running', type: CategoryType.SPORT, icon: '🏃', description: 'Running shoes, apparel and accessories', sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'Football', slug: 'football', type: CategoryType.SPORT, icon: '⚽', description: 'Football boots, jerseys and equipment', sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'Basketball', slug: 'basketball', type: CategoryType.SPORT, icon: '🏀', description: 'Basketball shoes, jerseys and gear', sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'Baseball', slug: 'baseball', type: CategoryType.SPORT, icon: '⚾', description: 'Baseball equipment and apparel', sortOrder: 4 } }),
    prisma.category.create({ data: { name: 'Cricket', slug: 'cricket', type: CategoryType.SPORT, icon: '🏏', description: 'Cricket bats, balls and protective gear', sortOrder: 5 } }),
    prisma.category.create({ data: { name: 'Tennis', slug: 'tennis', type: CategoryType.SPORT, icon: '🎾', description: 'Tennis rackets, shoes and apparel', sortOrder: 6 } }),
    prisma.category.create({ data: { name: 'Volleyball', slug: 'volleyball', type: CategoryType.SPORT, icon: '🏐', description: 'Volleyball equipment and apparel', sortOrder: 7 } }),
    prisma.category.create({ data: { name: 'Cycling', slug: 'cycling', type: CategoryType.SPORT, icon: '🚴', description: 'Cycling gear, helmets and accessories', sortOrder: 8 } }),
    prisma.category.create({ data: { name: 'Gym & Fitness', slug: 'gym-fitness', type: CategoryType.SPORT, icon: '🏋️', description: 'Gym equipment, weights and fitness apparel', sortOrder: 9 } }),
    prisma.category.create({ data: { name: 'Boxing', slug: 'boxing', type: CategoryType.SPORT, icon: '🥊', description: 'Boxing gloves, bags and protective gear', sortOrder: 10 } }),
    prisma.category.create({ data: { name: 'Golf', slug: 'golf', type: CategoryType.SPORT, icon: '⛳', description: 'Golf clubs, balls and apparel', sortOrder: 11 } }),
    prisma.category.create({ data: { name: 'Swimming', slug: 'swimming', type: CategoryType.SPORT, icon: '🏊', description: 'Swimsuits, goggles and swim gear', sortOrder: 12 } }),
    prisma.category.create({ data: { name: 'Hiking', slug: 'hiking', type: CategoryType.SPORT, icon: '🥾', description: 'Hiking boots, backpacks and outdoor gear', sortOrder: 13 } }),
    prisma.category.create({ data: { name: 'Training', slug: 'training', type: CategoryType.SPORT, icon: '💪', description: 'Training apparel and accessories', sortOrder: 14 } }),
    prisma.category.create({ data: { name: 'Other Sports', slug: 'other-sports', type: CategoryType.SPORT, icon: '🏅', description: 'Equipment for all other sports', sortOrder: 15 } }),
  ]);

  // ============================================================
  // CATEGORIES - Product Types
  // ============================================================
  const productTypes = await Promise.all([
    prisma.category.create({ data: { name: 'Shoes', slug: 'shoes', type: CategoryType.PRODUCT_TYPE, icon: '👟', description: 'Athletic footwear for all sports', sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'T-Shirts', slug: 't-shirts', type: CategoryType.PRODUCT_TYPE, icon: '👕', description: 'Athletic tops and t-shirts', sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'Jerseys', slug: 'jerseys', type: CategoryType.PRODUCT_TYPE, icon: '🎽', description: 'Team jerseys and kits', sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'Shorts', slug: 'shorts', type: CategoryType.PRODUCT_TYPE, icon: '🩳', description: 'Athletic shorts', sortOrder: 4 } }),
    prisma.category.create({ data: { name: 'Pants', slug: 'pants', type: CategoryType.PRODUCT_TYPE, icon: '👖', description: 'Athletic pants and tights', sortOrder: 5 } }),
    prisma.category.create({ data: { name: 'Hoodies', slug: 'hoodies', type: CategoryType.PRODUCT_TYPE, icon: '🧥', description: 'Hoodies and sweatshirts', sortOrder: 6 } }),
    prisma.category.create({ data: { name: 'Jackets', slug: 'jackets', type: CategoryType.PRODUCT_TYPE, icon: '🧥', description: 'Sports jackets and windbreakers', sortOrder: 7 } }),
    prisma.category.create({ data: { name: 'Tracksuits', slug: 'tracksuits', type: CategoryType.PRODUCT_TYPE, icon: '🏃', description: 'Matching tracksuit sets', sortOrder: 8 } }),
    prisma.category.create({ data: { name: 'Socks', slug: 'socks', type: CategoryType.PRODUCT_TYPE, icon: '🧦', description: 'Athletic socks', sortOrder: 9 } }),
    prisma.category.create({ data: { name: 'Caps', slug: 'caps', type: CategoryType.PRODUCT_TYPE, icon: '🧢', description: 'Caps, visors and headwear', sortOrder: 10 } }),
    prisma.category.create({ data: { name: 'Gloves', slug: 'gloves', type: CategoryType.PRODUCT_TYPE, icon: '🧤', description: 'Sports gloves', sortOrder: 11 } }),
    prisma.category.create({ data: { name: 'Bags', slug: 'bags', type: CategoryType.PRODUCT_TYPE, icon: '🎒', description: 'Sports bags and backpacks', sortOrder: 12 } }),
    prisma.category.create({ data: { name: 'Accessories', slug: 'accessories', type: CategoryType.PRODUCT_TYPE, icon: '⌚', description: 'Sports accessories', sortOrder: 13 } }),
    prisma.category.create({ data: { name: 'Equipment', slug: 'equipment', type: CategoryType.PRODUCT_TYPE, icon: '🏐', description: 'Sports equipment', sortOrder: 14 } }),
    prisma.category.create({ data: { name: 'Other', slug: 'other', type: CategoryType.PRODUCT_TYPE, icon: '📦', description: 'Other products', sortOrder: 15 } }),
  ]);

  // ============================================================
  // BRANDS
  // ============================================================
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'Nike', slug: 'nike' } }),
    prisma.brand.create({ data: { name: 'Adidas', slug: 'adidas' } }),
    prisma.brand.create({ data: { name: 'Under Armour', slug: 'under-armour' } }),
    prisma.brand.create({ data: { name: 'Puma', slug: 'puma' } }),
    prisma.brand.create({ data: { name: 'Reebok', slug: 'reebok' } }),
    prisma.brand.create({ data: { name: 'New Balance', slug: 'new-balance' } }),
  ]);

  // ============================================================
  // PRODUCTS
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
    imageSeed: string;
    variants: { color: string; size: string; stock: number }[];
  }

  const products: ProductSeed[] = [
    // Running shoes
    { name: 'Nike Air Zoom Pegasus 40', description: 'The Nike Air Zoom Pegasus 40 is a versatile running shoe with responsive cushioning and a breathable mesh upper. Perfect for daily training and long runs.', shortDescription: 'Versatile running shoe with responsive cushioning', price: 129.99, discountPrice: 99.99, brandIdx: 0, sportIdx: 0, typeIdx: 0, vendorIdx: 0, tags: ['running', 'shoes', 'nike', 'pegasus'], isFeatured: true, isTrending: true, imageSeed: 'nike-pegasus', variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 20) + 5 }))) },
    { name: 'Adidas Ultraboost 23', description: 'The Adidas Ultraboost 23 features Primeknit upper and Boost midsole for incredible energy return. A premium running shoe for serious athletes.', shortDescription: 'Premium running shoe with Boost technology', price: 189.99, discountPrice: null, brandIdx: 1, sportIdx: 0, typeIdx: 0, vendorIdx: 0, tags: ['running', 'shoes', 'adidas', 'ultraboost'], isFeatured: true, imageSeed: 'adidas-ultraboost', variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 15) + 3 }))) },
    { name: 'Nike ZoomX Invincible 3', description: 'The Nike ZoomX Invincible 3 offers maximum cushioning for long-distance running. ZoomX foam provides the highest energy return of any Nike running shoe.', shortDescription: 'Maximum cushioning for long-distance running', price: 179.99, discountPrice: 149.99, brandIdx: 0, sportIdx: 0, typeIdx: 0, vendorIdx: 0, tags: ['running', 'shoes', 'nike', 'zoomx', 'invincible'], isFeatured: true, imageSeed: 'nike-invincible', variants: shoeSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 12) + 2 }))) },
    { name: 'New Balance Fresh Foam 1080v13', description: 'The New Balance Fresh Foam 1080v13 delivers plush comfort for neutral runners. Fresh Foam X cushioning provides a smooth, soft ride.', shortDescription: 'Plush comfort for neutral runners', price: 164.99, discountPrice: null, brandIdx: 5, sportIdx: 0, typeIdx: 0, vendorIdx: 0, tags: ['running', 'shoes', 'new-balance', 'fresh-foam'], imageSeed: 'nb-1080', variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 18) + 4 }))) },
    { name: 'Adidas Terrex Agravic Trail', description: 'The Adidas Terrex Agravic Trail is built for off-road running with Continental rubber outsole and protective rock plate.', shortDescription: 'Trail running shoe with superior grip', price: 149.99, discountPrice: 119.99, brandIdx: 1, sportIdx: 0, typeIdx: 0, vendorIdx: 0, tags: ['trail', 'running', 'shoes', 'adidas', 'terrex'], imageSeed: 'adidas-terrex', variants: shoeSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 10) + 2 }))) },
    { name: 'UA Charged Assert 10', description: 'The Under Armour Charged Assert 10 offers responsive cushioning for everyday running. Durable leather upper provides stability.', shortDescription: 'Responsive cushioning for everyday running', price: 74.99, discountPrice: 59.99, brandIdx: 2, sportIdx: 0, typeIdx: 0, vendorIdx: 0, tags: ['running', 'shoes', 'under-armour', 'charged'], imageSeed: 'ua-assert', variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 25) + 8 }))) },

    // Football
    { name: 'Nike Mercurial Vapor 15 Elite', description: 'The Nike Mercurial Vapor 15 Elite is built for speed with a lightweight Flyknit upper and responsive Zoom Air unit.', shortDescription: 'Lightweight speed boot for elite players', price: 274.99, discountPrice: 229.99, brandIdx: 0, sportIdx: 1, typeIdx: 0, vendorIdx: 1, tags: ['football', 'boots', 'nike', 'mercurial'], isFeatured: true, isTrending: true, imageSeed: 'nike-mercurial', variants: shoeSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 15) + 3 }))) },
    { name: 'Adidas Copa Pure 2 Elite', description: 'The Adidas Copa Pure 2 Elite features premium K-leather upper for ultimate touch and comfort. A classic football boot reimagined.', shortDescription: 'Premium leather football boot', price: 279.99, discountPrice: null, brandIdx: 1, sportIdx: 1, typeIdx: 0, vendorIdx: 1, tags: ['football', 'boots', 'adidas', 'copa'], imageSeed: 'adidas-copa', variants: shoeSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 12) + 2 }))) },
    { name: 'Puma Future 7 Play', description: 'The Puma Future 7 Play offers adaptive fit for creative players. FUZIONFIT360 upper provides lockdown and agility.', shortDescription: 'Adaptive fit for creative players', price: 129.99, discountPrice: 99.99, brandIdx: 3, sportIdx: 1, typeIdx: 0, vendorIdx: 1, tags: ['football', 'boots', 'puma', 'future'], imageSeed: 'puma-future', variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 18) + 5 }))) },
    { name: 'Nike Academy Team Jersey', description: 'The Nike Academy Team Jersey features Dri-FIT technology to keep you dry during matches. Lightweight and breathable.', shortDescription: 'Dri-FIT match jersey', price: 49.99, discountPrice: null, brandIdx: 0, sportIdx: 1, typeIdx: 2, vendorIdx: 1, tags: ['jersey', 'football', 'nike', 'academy'], imageSeed: 'nike-jersey', variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 30) + 10 }))) },
    { name: 'Adidas Condivo 24 Training Jersey', description: 'The Adidas Condivo 24 Training Jersey is designed for intense practice sessions. AEROREADY fabric keeps you cool and dry.', shortDescription: 'Training jersey with AEROREADY', price: 34.99, discountPrice: 27.99, brandIdx: 1, sportIdx: 1, typeIdx: 2, vendorIdx: 1, tags: ['jersey', 'football', 'adidas', 'training'], imageSeed: 'adidas-jersey', variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 25) + 8 }))) },
    { name: 'Nike Strike Team Football', description: 'The Nike Strike Team Football is built for practice and match play. Durable construction with excellent flight stability.', shortDescription: 'Durable practice and match football', price: 29.99, discountPrice: 24.99, brandIdx: 0, sportIdx: 1, typeIdx: 13, vendorIdx: 1, tags: ['football', 'ball', 'nike', 'strike'], imageSeed: 'nike-ball', variants: [{ color: 'White', size: '5', stock: 50 }, { color: 'Yellow', size: '5', stock: 30 }] },

    // Basketball
    { name: 'Nike Air Force 1 \'07', description: 'The Nike Air Force 1 \'07 is a classic basketball shoe with timeless style. Premium leather and Air cushioning.', shortDescription: 'Classic basketball shoe with Air cushioning', price: 109.99, discountPrice: null, brandIdx: 0, sportIdx: 2, typeIdx: 0, vendorIdx: 0, tags: ['basketball', 'shoes', 'nike', 'air-force'], isTrending: true, imageSeed: 'nike-af1', variants: shoeSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 20) + 5 }))) },
    { name: 'Nike Zoom Freak 5', description: 'The Nike Zoom Freak 5 is built for explosive basketball performance. Designed for Giannis Antetokounmpo.', shortDescription: 'Explosive performance basketball shoe', price: 139.99, discountPrice: null, brandIdx: 0, sportIdx: 2, typeIdx: 0, vendorIdx: 1, tags: ['basketball', 'shoes', 'nike', 'freak'], imageSeed: 'nike-freak', variants: shoeSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 15) + 3 }))) },
    { name: 'UA Baseline Basketball Shorts', description: 'The Under Armour Baseline Basketball Shorts offer lightweight comfort on the court. HeatGear fabric keeps you cool.', shortDescription: 'Lightweight basketball shorts', price: 34.99, discountPrice: null, brandIdx: 2, sportIdx: 2, typeIdx: 3, vendorIdx: 1, tags: ['basketball', 'shorts', 'under-armour'], imageSeed: 'ua-shorts', variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 35) + 12 }))) },

    // Tennis
    { name: 'Nike Court Legacy Next Nature', description: 'The Nike Court Legacy Next Nature brings sustainable materials to a classic court shoe design. Durable and comfortable.', shortDescription: 'Sustainable classic court shoe', price: 59.99, discountPrice: null, brandIdx: 0, sportIdx: 5, typeIdx: 0, vendorIdx: 0, tags: ['tennis', 'shoes', 'nike', 'court'], imageSeed: 'nike-court', variants: shoeSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 18) + 4 }))) },
    { name: 'Adidas Gamecourt 2.0', description: 'The Adidas Gamecourt 2.0 is a versatile tennis shoe with Adiwear outsole and Bounce cushioning.', shortDescription: 'Versatile tennis shoe with Bounce', price: 74.99, discountPrice: 59.99, brandIdx: 1, sportIdx: 5, typeIdx: 0, vendorIdx: 3, tags: ['tennis', 'shoes', 'adidas', 'gamecourt'], imageSeed: 'adidas-gamecourt', variants: shoeSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 14) + 3 }))) },

    // Training / Gym
    { name: 'Nike Dri-FIT Academy T-Shirt', description: 'The Nike Dri-FIT Academy T-Shirt keeps you dry during intense training sessions. Lightweight and breathable.', shortDescription: 'Dri-FIT training t-shirt', price: 29.99, discountPrice: null, brandIdx: 0, sportIdx: 13, typeIdx: 1, vendorIdx: 1, tags: ['t-shirt', 'training', 'nike', 'dri-fit'], imageSeed: 'nike-drifit-tee', variants: apparelSizes.flatMap((s) => colors.slice(0, 4).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 40) + 15 }))) },
    { name: 'Adidas Own The Run Tee', description: 'The Adidas Own The Run Tee features AEROREADY technology for moisture management during workouts.', shortDescription: 'AEROREADY running tee', price: 29.99, discountPrice: 24.99, brandIdx: 1, sportIdx: 0, typeIdx: 1, vendorIdx: 0, tags: ['t-shirt', 'running', 'adidas'], imageSeed: 'adidas-run-tee', variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 35) + 10 }))) },
    { name: 'UA Tech 2.0 Short Sleeve', description: 'The Under Armour Tech 2.0 Short Sleeve is soft, light, and quick-drying. Perfect for training.', shortDescription: 'Soft, light, quick-drying training tee', price: 24.99, discountPrice: 19.99, brandIdx: 2, sportIdx: 13, typeIdx: 1, vendorIdx: 2, tags: ['t-shirt', 'training', 'under-armour'], imageSeed: 'ua-tech-tee', variants: apparelSizes.flatMap((s) => colors.slice(0, 4).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 45) + 18 }))) },
    { name: 'Nike Pro Hyperstrong Compression Top', description: 'The Nike Pro Hyperstrong Compression Top provides support and flexibility for intense workouts.', shortDescription: 'Compression top for support', price: 44.99, discountPrice: null, brandIdx: 0, sportIdx: 13, typeIdx: 1, vendorIdx: 2, tags: ['compression', 'training', 'nike', 'pro'], imageSeed: 'nike-compression', variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 25) + 8 }))) },

    // Hoodies
    { name: 'Nike Sportswear Club Fleece Pullover Hoodie', description: 'The Nike Sportswear Club Fleece Pullover Hoodie is a wardrobe essential. Soft fleece with a relaxed fit.', shortDescription: 'Soft fleece pullover hoodie', price: 59.99, discountPrice: 44.99, brandIdx: 0, sportIdx: 13, typeIdx: 5, vendorIdx: 2, tags: ['hoodie', 'nike', 'fleece', 'casual'], isTrending: true, imageSeed: 'nike-hoodie', variants: apparelSizes.flatMap((s) => colors.slice(0, 4).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 30) + 10 }))) },
    { name: 'UA Rival Fleece Full-Zip Hoodie', description: 'The Under Armour Rival Fleece Full-Zip Hoodie offers versatile warmth for training and casual wear.', shortDescription: 'Versatile full-zip fleece hoodie', price: 54.99, discountPrice: 44.99, brandIdx: 2, sportIdx: 13, typeIdx: 5, vendorIdx: 2, tags: ['hoodie', 'under-armour', 'fleece'], imageSeed: 'ua-hoodie', variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 28) + 9 }))) },
    { name: 'Puma Essentials Logo Hoodie', description: 'The Puma Essentials Logo Hoodie offers everyday comfort with a classic look. Soft cotton blend fleece.', shortDescription: 'Everyday comfort hoodie', price: 49.99, discountPrice: 39.99, brandIdx: 3, sportIdx: 13, typeIdx: 5, vendorIdx: 2, tags: ['hoodie', 'puma', 'essentials'], imageSeed: 'puma-hoodie', variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 22) + 7 }))) },

    // Jackets
    { name: 'Nike Sportswear Tech Fleece Windrunner', description: 'The Nike Sportswear Tech Fleece Windrunner is a modern classic. Lightweight warmth with zippered pockets.', shortDescription: 'Modern classic windrunner jacket', price: 119.99, discountPrice: 99.99, brandIdx: 0, sportIdx: 13, typeIdx: 6, vendorIdx: 2, tags: ['jacket', 'nike', 'tech-fleece', 'windrunner'], imageSeed: 'nike-windrunner', variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 20) + 5 }))) },
    { name: 'Adidas Tiro 24 Training Jacket', description: 'The Adidas Tiro 24 Training Jacket offers warmth and mobility for cold-weather training. Slim fit with AEROREADY.', shortDescription: 'Warm training jacket for cold weather', price: 59.99, discountPrice: 49.99, brandIdx: 1, sportIdx: 1, typeIdx: 6, vendorIdx: 1, tags: ['jacket', 'adidas', 'tiro', 'training'], imageSeed: 'adidas-tiro', variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 18) + 4 }))) },
    { name: 'Nike Academy Woven Full-Zip Jacket', description: 'The Nike Academy Woven Full-Zip Jacket provides lightweight protection from the elements.', shortDescription: 'Lightweight woven jacket', price: 69.99, discountPrice: 54.99, brandIdx: 0, sportIdx: 1, typeIdx: 6, vendorIdx: 1, tags: ['jacket', 'nike', 'academy', 'woven'], imageSeed: 'nike-woven-jacket', variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 16) + 3 }))) },

    // Pants / Tights
    { name: 'Nike Sportswear Tech Fleece Joggers', description: 'The Nike Sportswear Tech Fleece Joggers combine warmth with a modern look. Tapered fit for a sleek silhouette.', shortDescription: 'Warm tapered joggers', price: 109.99, discountPrice: 89.99, brandIdx: 0, sportIdx: 13, typeIdx: 4, vendorIdx: 2, tags: ['joggers', 'nike', 'tech-fleece'], imageSeed: 'nike-joggers', variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 25) + 8 }))) },
    { name: 'Adidas Own The Run Tights', description: 'The Adidas Own The Run Tights provide support and comfort for runners. AEROREADY fabric keeps you dry.', shortDescription: 'Supportive running tights', price: 39.99, discountPrice: 32.99, brandIdx: 1, sportIdx: 0, typeIdx: 4, vendorIdx: 0, tags: ['tights', 'adidas', 'running'], imageSeed: 'adidas-tights', variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 20) + 5 }))) },
    { name: 'UA Meridian Joggers', description: 'The Under Armour Meridian Joggers offer a sleek fit with stretch fabric for maximum mobility.', shortDescription: 'Sleek stretch joggers', price: 59.99, discountPrice: 49.99, brandIdx: 2, sportIdx: 13, typeIdx: 4, vendorIdx: 2, tags: ['joggers', 'under-armour', 'meridian'], imageSeed: 'ua-joggers', variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 18) + 4 }))) },

    // Shorts
    { name: 'Nike Academy Woven Shorts', description: 'The Nike Academy Woven Shorts are lightweight and breathable for training. Elastic waistband with drawcord.', shortDescription: 'Lightweight training shorts', price: 39.99, discountPrice: null, brandIdx: 0, sportIdx: 1, typeIdx: 3, vendorIdx: 1, tags: ['shorts', 'nike', 'academy'], imageSeed: 'nike-shorts', variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 30) + 10 }))) },
    { name: 'Adidas Tastigo 24 Shorts', description: 'The Adidas Tastigo 24 Shorts are lightweight and breathable for training. AEROREADY fabric.', shortDescription: 'Lightweight training shorts', price: 29.99, discountPrice: 24.99, brandIdx: 1, sportIdx: 1, typeIdx: 3, vendorIdx: 1, tags: ['shorts', 'adidas', 'tastigo'], imageSeed: 'adidas-shorts', variants: apparelSizes.flatMap((s) => colors.slice(0, 3).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 35) + 12 }))) },
    { name: 'Puma evoKNIT Shorts', description: 'The Puma evoKNIT Shorts offer a seamless fit for unrestricted movement. Lightweight and breathable.', shortDescription: 'Seamless training shorts', price: 34.99, discountPrice: 27.99, brandIdx: 3, sportIdx: 13, typeIdx: 3, vendorIdx: 0, tags: ['shorts', 'puma', 'evoknit', 'training'], imageSeed: 'puma-shorts', variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 22) + 6 }))) },

    // Tracksuits
    { name: 'Nike Academy Team Tracksuit', description: 'The Nike Academy Team Tracksuit provides matching style for the whole team. Dri-FIT technology throughout.', shortDescription: 'Matching team tracksuit', price: 99.99, discountPrice: 79.99, brandIdx: 0, sportIdx: 1, typeIdx: 7, vendorIdx: 1, tags: ['tracksuit', 'nike', 'academy', 'team'], imageSeed: 'nike-tracksuit', variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 15) + 3 }))) },
    { name: 'Adidas Tiro 24 Tracksuit', description: 'The Adidas Tiro 24 Tracksuit is a classic design with modern performance. AEROREADY fabric keeps you dry.', shortDescription: 'Classic performance tracksuit', price: 89.99, discountPrice: 74.99, brandIdx: 1, sportIdx: 1, typeIdx: 7, vendorIdx: 1, tags: ['tracksuit', 'adidas', 'tiro'], imageSeed: 'adidas-tracksuit', variants: apparelSizes.flatMap((s) => colors.slice(0, 2).map((c) => ({ color: c, size: s, stock: Math.floor(Math.random() * 14) + 3 }))) },

    // Socks
    { name: 'Nike Everyday Max Cushioned Socks', description: 'The Nike Everyday Max Cushioned Socks provide maximum comfort with extra cushioning in high-impact areas.', shortDescription: 'Maximum cushioning socks', price: 18.99, discountPrice: 14.99, brandIdx: 0, sportIdx: 13, typeIdx: 8, vendorIdx: 2, tags: ['socks', 'nike', 'cushioned'], imageSeed: 'nike-socks', variants: [{ color: 'White', size: 'M', stock: 100 }, { color: 'Black', size: 'M', stock: 80 }, { color: 'White', size: 'L', stock: 90 }, { color: 'Black', size: 'L', stock: 70 }] },
    { name: 'Nike Everyday Cushioned Training Socks 3-Pack', description: 'The Nike Everyday Cushioned Training Socks 3-Pack provides comfort and support for daily training.', shortDescription: '3-pack training socks', price: 16.99, discountPrice: 12.99, brandIdx: 0, sportIdx: 13, typeIdx: 8, vendorIdx: 2, tags: ['socks', 'nike', 'training', '3-pack'], imageSeed: 'nike-socks-3pack', variants: [{ color: 'White', size: 'M', stock: 120 }, { color: 'Black', size: 'M', stock: 100 }, { color: 'White', size: 'L', stock: 110 }, { color: 'Black', size: 'L', stock: 90 }] },

    // Caps
    { name: 'Nike Dri-FIT Swoosh Cap', description: 'The Nike Dri-FIT Swoosh Cap features moisture-wicking fabric and adjustable fit for all-day comfort.', shortDescription: 'Moisture-wicking adjustable cap', price: 27.99, discountPrice: null, brandIdx: 0, sportIdx: 13, typeIdx: 9, vendorIdx: 2, tags: ['cap', 'nike', 'dri-fit'], imageSeed: 'nike-cap', variants: [{ color: 'Black', size: 'One Size', stock: 60 }, { color: 'White', size: 'One Size', stock: 50 }, { color: 'Navy', size: 'One Size', stock: 40 }] },
    { name: 'Nike Dri-FIT Swoosh Visor', description: 'The Nike Dri-FIT Swoosh Visor keeps the sun out of your eyes during workouts and outdoor activities.', shortDescription: 'Sun protection visor', price: 22.99, discountPrice: null, brandIdx: 0, sportIdx: 13, typeIdx: 9, vendorIdx: 2, tags: ['visor', 'nike', 'dri-fit'], imageSeed: 'nike-visor', variants: [{ color: 'Black', size: 'One Size', stock: 45 }, { color: 'White', size: 'One Size', stock: 35 }] },

    // Bags
    { name: 'Nike Academy Team Backpack', description: 'The Nike Academy Team Backpack features multiple compartments for gear organization. Padded laptop sleeve.', shortDescription: 'Multi-compartment gear backpack', price: 49.99, discountPrice: 39.99, brandIdx: 0, sportIdx: 1, typeIdx: 11, vendorIdx: 1, tags: ['backpack', 'nike', 'academy'], imageSeed: 'nike-backpack', variants: [{ color: 'Black', size: 'One Size', stock: 40 }, { color: 'Navy', size: 'One Size', stock: 30 }] },
    { name: 'Adidas Defender IV Duffel Bag', description: 'The Adidas Defender IV Duffel Bag offers spacious storage with durable construction. Ventilated shoe compartment.', shortDescription: 'Spacious duffel with shoe compartment', price: 39.99, discountPrice: 29.99, brandIdx: 1, sportIdx: 13, typeIdx: 11, vendorIdx: 2, tags: ['bag', 'adidas', 'duffel', 'defender'], imageSeed: 'adidas-duffel', variants: [{ color: 'Black', size: 'One Size', stock: 55 }, { color: 'Grey', size: 'One Size', stock: 35 }] },
    { name: 'Adidas Squad 21 Backpack', description: 'The Adidas Squad 21 Backpack offers versatile storage for everyday use. Padded shoulder straps.', shortDescription: 'Versatile everyday backpack', price: 39.99, discountPrice: 32.99, brandIdx: 1, sportIdx: 13, typeIdx: 11, vendorIdx: 2, tags: ['backpack', 'adidas', 'squad'], imageSeed: 'adidas-backpack', variants: [{ color: 'Black', size: 'One Size', stock: 45 }, { color: 'Blue', size: 'One Size', stock: 30 }] },

    // Accessories
    { name: 'Nike Dri-FIT Swoosh Headband', description: 'The Nike Dri-FIT Swoosh Headband keeps sweat out of your eyes during workouts. Stretchy and comfortable.', shortDescription: 'Sweat-wicking headband', price: 12.99, discountPrice: null, brandIdx: 0, sportIdx: 13, typeIdx: 12, vendorIdx: 2, tags: ['headband', 'nike', 'dri-fit'], imageSeed: 'nike-headband', variants: [{ color: 'Black', size: 'One Size', stock: 80 }, { color: 'White', size: 'One Size', stock: 70 }, { color: 'Pink', size: 'One Size', stock: 50 }] },
    { name: 'Nike Dri-FIT Swoosh Gloves', description: 'The Nike Dri-FIT Swoosh Gloves provide grip and warmth for outdoor training. Touchscreen compatible.', shortDescription: 'Grip gloves with touchscreen compatibility', price: 24.99, discountPrice: null, brandIdx: 0, sportIdx: 13, typeIdx: 10, vendorIdx: 2, tags: ['gloves', 'nike', 'dri-fit'], imageSeed: 'nike-gloves', variants: [{ color: 'Black', size: 'S', stock: 40 }, { color: 'Black', size: 'M', stock: 50 }, { color: 'Black', size: 'L', stock: 45 }] },

    // Equipment
    { name: 'Nike Strike Team Football', description: 'The Nike Strike Team Football is built for practice and match play. Durable construction with excellent flight stability.', shortDescription: 'Durable practice and match football', price: 29.99, discountPrice: 24.99, brandIdx: 0, sportIdx: 1, typeIdx: 13, vendorIdx: 1, tags: ['football', 'ball', 'nike', 'strike'], imageSeed: 'nike-football', variants: [{ color: 'White', size: '5', stock: 50 }, { color: 'Yellow', size: '5', stock: 30 }] },
    { name: 'Adidas Tiro 24 Training Ball', description: 'The Adidas Tiro 24 Training Ball is designed for consistent flight and durability on all surfaces.', shortDescription: 'Durable training ball', price: 24.99, discountPrice: 19.99, brandIdx: 1, sportIdx: 1, typeIdx: 13, vendorIdx: 1, tags: ['football', 'ball', 'adidas', 'training'], imageSeed: 'adidas-ball', variants: [{ color: 'White', size: '5', stock: 60 }, { color: 'Orange', size: '5', stock: 40 }] },
  ];

  // Create products with variants and images
  const createdProducts: any[] = [];
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
          create: [0, 1, 2].map((imgIdx) => ({
            url: img(`${p.imageSeed}-${imgIdx}`),
            alt: `${p.name} - view ${imgIdx + 1}`,
            isPrimary: imgIdx === 0,
            sortOrder: imgIdx,
          })),
        },
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
      imageUrl: img('promo-summer', 1200, 400),
      linkUrl: '/products?onSale=true',
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.promotion.create({
    data: {
      title: 'New Arrivals',
      subtitle: 'Check out the latest gear',
      imageUrl: img('promo-new', 1200, 400),
      linkUrl: '/products?sort=newest',
      isActive: true,
      sortOrder: 2,
    },
  });

  await prisma.promotion.create({
    data: {
      title: 'Free Shipping',
      subtitle: 'On orders over $100',
      imageUrl: img('promo-shipping', 1200, 400),
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
  console.log(`  Vendors: velocity@xeno.com, apex@xeno.com, nova@xeno.com, zenith@xeno.com / Vendor123!`);
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
