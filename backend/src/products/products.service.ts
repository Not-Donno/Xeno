import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateVariantStockDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  }

  // ---------------------------------------------------------------
  // Public product queries
  // ---------------------------------------------------------------
  async getProducts(query: {
    search?: string;
    sport?: string;
    type?: string;
    brand?: string;
    vendor?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    color?: string;
    minRating?: number;
    inStock?: string;
    onSale?: string;
    sort?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
    newArrival?: boolean;
    trending?: boolean;
  }) {
    const {
      search, sport, type, brand, vendor, minPrice, maxPrice, size, color,
      minRating, inStock, onSale, sort = 'newest', page = 1, limit = 12,
      featured, newArrival, trending,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE' };

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { has: search.toLowerCase() } },
            { brand: { name: { contains: search, mode: 'insensitive' } } },
            { vendor: { name: { contains: search, mode: 'insensitive' } } },
          ],
        },
      ];
    }
    if (sport) where.sportCategory = { slug: sport };
    if (type) where.productType = { slug: type };
    if (brand) where.brand = { slug: brand };
    if (vendor) where.vendor = { slug: vendor };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (size || color) {
      where.variants = {
        some: {
          ...(size ? { size } : {}),
          ...(color ? { color } : {}),
        },
      };
    }
    if (minRating !== undefined) where.rating = { gte: minRating };
    if (inStock === 'true') where.variants = { ...(where.variants || {}), some: { ...(where.variants?.some || {}), stock: { gt: 0 } } };
    if (onSale === 'true') where.discountPrice = { not: null };
    if (featured) where.isFeatured = true;
    if (newArrival) where.isNewArrival = true;
    if (trending) where.isTrending = true;

    const orderBy: any =
      sort === 'price-asc'
        ? { price: 'asc' }
        : sort === 'price-desc'
          ? { price: 'desc' }
          : sort === 'rating'
            ? { rating: 'desc' }
            : sort === 'popular'
              ? { salesCount: 'desc' }
              : sort === 'name'
                ? { name: 'asc' }
                : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          brand: true,
          vendor: { select: { id: true, name: true, slug: true, logoUrl: true } },
          sportCategory: { select: { id: true, name: true, slug: true } },
          productType: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          _count: { select: { reviews: true, variants: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            bannerUrl: true,
            description: true,
            rating: true,
            totalSales: true,
            createdAt: true,
            socialLinks: true,
            _count: { select: { products: true } },
          },
        },
        sportCategory: true,
        productType: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
        _count: { select: { reviews: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return { product };
  }

  async getRelatedProducts(productId: string, limit = 8) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { sportCategoryId: true, productTypeId: true, vendorId: true },
    });
    if (!product) return { products: [] };

    const products = await this.prisma.product.findMany({
      where: {
        id: { not: productId },
        status: 'ACTIVE',
        OR: [
          { sportCategoryId: product.sportCategoryId },
          { productTypeId: product.productTypeId },
        ],
      },
      include: {
        brand: true,
        vendor: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: limit,
      orderBy: { salesCount: 'desc' },
    });
    return { products };
  }

  async getVendorMoreProducts(vendorId: string, excludeId: string, limit = 8) {
    const products = await this.prisma.product.findMany({
      where: { vendorId, id: { not: excludeId }, status: 'ACTIVE' },
      include: {
        brand: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return { products };
  }

  async getFeatured(limit = 8) {
    const products = await this.prisma.product.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      include: {
        brand: true,
        vendor: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: limit,
      orderBy: { salesCount: 'desc' },
    });
    return { products };
  }

  async getNewArrivals(limit = 8) {
    const products = await this.prisma.product.findMany({
      where: { status: 'ACTIVE', isNewArrival: true },
      include: {
        brand: true,
        vendor: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return { products };
  }

  async getTrending(limit = 8) {
    const products = await this.prisma.product.findMany({
      where: { status: 'ACTIVE', isTrending: true },
      include: {
        brand: true,
        vendor: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: limit,
      orderBy: { salesCount: 'desc' },
    });
    return { products };
  }

  // ---------------------------------------------------------------
  // Vendor product management (own products only)
  // ---------------------------------------------------------------
  private async getOwnVendorId(user: AuthUser): Promise<string> {
    if (!user.vendorId) {
      throw new ForbiddenException('You do not have a vendor account');
    }
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: user.vendorId },
    });
    if (!vendor || vendor.userId !== user.id) {
      throw new ForbiddenException('Vendor account not found');
    }
    return vendor.id;
  }

  async getVendorProducts(
    user: AuthUser,
    params: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    const vendorId = await this.getOwnVendorId(user);
    const { page = 1, limit = 20, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = { vendorId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          brand: true,
          sportCategory: true,
          productType: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          _count: { select: { reviews: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  async createProduct(user: AuthUser, dto: CreateProductDto) {
    const vendorId = await this.getOwnVendorId(user);

    const brand = await this.prisma.brand.findUnique({
      where: { id: dto.brandId },
    });
    if (!brand) throw new BadRequestException('Brand not found');

    if (dto.sportCategoryId) {
      const cat = await this.prisma.category.findFirst({
        where: { id: dto.sportCategoryId, type: 'SPORT' },
      });
      if (!cat) throw new BadRequestException('Sport category not found');
    }
    if (dto.productTypeId) {
      const cat = await this.prisma.category.findFirst({
        where: { id: dto.productTypeId, type: 'PRODUCT_TYPE' },
      });
      if (!cat) throw new BadRequestException('Product type not found');
    }

    let slug = this.slugify(dto.name);
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        price: dto.price,
        discountPrice: dto.discountPrice,
        sku: dto.sku,
        brandId: dto.brandId,
        sportCategoryId: dto.sportCategoryId,
        productTypeId: dto.productTypeId,
        vendorId,
        weight: dto.weight,
        tags: dto.tags || [],
        isFeatured: dto.isFeatured ?? false,
        isNewArrival: dto.isNewArrival ?? true,
        isTrending: dto.isTrending ?? false,
        variants: dto.variants?.length
          ? { create: dto.variants }
          : undefined,
        images: dto.images?.length
          ? {
              create: dto.images.map((url, i) => ({
                url,
                isPrimary: i === 0,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: {
        brand: true,
        images: true,
        variants: true,
      },
    });

    return { product };
  }

  async updateProduct(user: AuthUser, productId: string, dto: UpdateProductDto) {
    const vendorId = await this.getOwnVendorId(user);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, vendorId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name,
        description: dto.description,
        shortDescription: dto.shortDescription,
        price: dto.price,
        discountPrice: dto.discountPrice,
        brandId: dto.brandId,
        sportCategoryId: dto.sportCategoryId,
        productTypeId: dto.productTypeId,
        weight: dto.weight,
        tags: dto.tags,
        isFeatured: dto.isFeatured,
        isNewArrival: dto.isNewArrival,
        isTrending: dto.isTrending,
      },
      include: {
        brand: true,
        images: true,
        variants: true,
      },
    });
    return { product: updated };
  }

  async deleteProduct(user: AuthUser, productId: string) {
    const vendorId = await this.getOwnVendorId(user);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, vendorId },
    });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.product.delete({ where: { id: productId } });
    return { success: true };
  }

  async addProductImage(user: AuthUser, productId: string, url: string) {
    const vendorId = await this.getOwnVendorId(user);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, vendorId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const count = await this.prisma.productImage.count({
      where: { productId },
    });
    const image = await this.prisma.productImage.create({
      data: {
        productId,
        url,
        isPrimary: count === 0,
        sortOrder: count,
      },
    });
    return { image };
  }

  async removeProductImage(user: AuthUser, productId: string, imageId: string) {
    const vendorId = await this.getOwnVendorId(user);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, vendorId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) throw new NotFoundException('Image not found');

    await this.prisma.productImage.delete({ where: { id: imageId } });
    return { success: true };
  }

  async setPrimaryImage(user: AuthUser, productId: string, imageId: string) {
    const vendorId = await this.getOwnVendorId(user);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, vendorId },
    });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.$transaction([
      this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      this.prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);
    return { success: true };
  }

  async updateVariantStock(
    user: AuthUser,
    productId: string,
    variantId: string,
    dto: UpdateVariantStockDto,
  ) {
    const vendorId = await this.getOwnVendorId(user);
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId, product: { vendorId } },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: dto.stock },
    });
    return { variant: updated };
  }

  async addVariant(
    user: AuthUser,
    productId: string,
    variant: { color: string; size: string; sku: string; stock: number; price?: number },
  ) {
    const vendorId = await this.getOwnVendorId(user);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, vendorId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const created = await this.prisma.productVariant.create({
      data: { productId, ...variant },
    });
    return { variant: created };
  }

  async removeVariant(user: AuthUser, productId: string, variantId: string) {
    const vendorId = await this.getOwnVendorId(user);
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId, product: { vendorId } },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    await this.prisma.productVariant.delete({ where: { id: variantId } });
    return { success: true };
  }
}
