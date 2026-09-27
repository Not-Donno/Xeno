import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import {
  ApplyVendorDto,
  UpdateVendorProfileDto,
  UpdateVendorStatusDto,
} from './dto/vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  }

  // ---------------------------------------------------------------
  // Public vendor directory
  // ---------------------------------------------------------------
  async getVendors(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 12, search } = params;
    const skip = (page - 1) * limit;

    const where: any = { status: 'APPROVED' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        include: {
          _count: { select: { products: true } },
        },
        skip,
        take: limit,
        orderBy: [{ totalSales: 'desc' }, { rating: 'desc' }],
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return { vendors, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getVendorBySlug(slug: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { slug },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
        _count: { select: { products: true, reviews: true } },
      },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return { vendor };
  }

  async getVendorProducts(
    slug: string,
    params: {
      page?: number;
      limit?: number;
      sort?: string;
      category?: string;
      search?: string;
    },
  ) {
    const { page = 1, limit = 12, sort = 'newest', category, search } = params;
    const skip = (page - 1) * limit;

    const vendor = await this.prisma.vendor.findUnique({ where: { slug } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const where: any = {
      vendorId: vendor.id,
      status: 'ACTIVE',
    };
    if (category) {
      where.OR = [
        { sportCategory: { slug: category } },
        { productType: { slug: category } },
      ];
    }
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { name: { contains: search, mode: 'insensitive' } } },
          ],
        },
      ];
    }

    const orderBy: any =
      sort === 'price-asc'
        ? { price: 'asc' }
        : sort === 'price-desc'
          ? { price: 'desc' }
          : sort === 'popular'
            ? { salesCount: 'desc' }
            : sort === 'rating'
              ? { rating: 'desc' }
              : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          brand: true,
          productType: true,
          sportCategory: true,
          images: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { reviews: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ---------------------------------------------------------------
  // Vendor application
  // ---------------------------------------------------------------
  async apply(user: AuthUser, dto: ApplyVendorDto) {
    const existing = await this.prisma.vendor.findUnique({
      where: { userId: user.id },
    });
    if (existing) {
      throw new BadRequestException('You already have a vendor application');
    }

    let slug = this.slugify(dto.name);
    const slugExists = await this.prisma.vendor.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const vendor = await this.prisma.vendor.create({
      data: {
        userId: user.id,
        name: dto.name,
        slug,
        description: dto.description,
        logoUrl: dto.logoUrl,
        bannerUrl: dto.bannerUrl,
        status: 'PENDING',
      },
    });

    await this.notificationsService.createNotification(user.id, {
      title: 'Vendor application received',
      body: `Your application to open "${dto.name}" has been received and is pending review.`,
      type: 'VENDOR_APPLICATION',
    });

    return { vendor, message: 'Application submitted. It will be reviewed by our team.' };
  }

  // ---------------------------------------------------------------
  // Vendor dashboard (own data only)
  // ---------------------------------------------------------------
  private async getOwnVendor(user: AuthUser) {
    if (!user.vendorId) {
      throw new ForbiddenException('You do not have a vendor account');
    }
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: user.vendorId },
    });
    if (!vendor || vendor.userId !== user.id) {
      throw new ForbiddenException('Vendor account not found');
    }
    return vendor;
  }

  async getDashboard(user: AuthUser) {
    const vendor = await this.getOwnVendor(user);

    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders,
      topProducts,
      recentReviews,
    ] = await Promise.all([
      this.prisma.product.count({ where: { vendorId: vendor.id } }),
      this.prisma.product.count({
        where: { vendorId: vendor.id, status: 'ACTIVE' },
      }),
      this.prisma.productVariant.groupBy({
        by: ['productId'],
        where: { product: { vendorId: vendor.id } },
        _sum: { stock: true },
        having: { stock: { _sum: { lte: 5 } } },
      }),
      this.prisma.orderItem.count({
        where: { vendorId: vendor.id },
      }),
      this.prisma.orderItem.count({
        where: { vendorId: vendor.id, status: 'PENDING' },
      }),
      this.prisma.orderItem.aggregate({
        where: { vendorId: vendor.id, status: { in: ['DELIVERED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'PROCESSING', 'CONFIRMED'] } },
        _sum: { totalPrice: true },
      }),
      this.prisma.orderItem.findMany({
        where: { vendorId: vendor.id },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              createdAt: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
          product: { select: { name: true, slug: true, images: { take: 1 } } },
          variant: { select: { size: true, color: true } },
        },
        orderBy: { order: { createdAt: 'desc' } },
        take: 10,
      }),
      this.prisma.product.findMany({
        where: { vendorId: vendor.id, status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salesCount: true,
          rating: true,
          images: { take: 1 },
        },
        orderBy: { salesCount: 'desc' },
        take: 5,
      }),
      this.prisma.review.findMany({
        where: { vendorId: vendor.id },
        include: {
          user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          product: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      stats: {
        totalProducts,
        activeProducts,
        lowStockCount: lowStockProducts.length,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        rating: vendor.rating,
      },
      recentOrders,
      topProducts,
      recentReviews,
    };
  }

  async getVendorOrders(
    user: AuthUser,
    params: { page?: number; limit?: number; status?: string },
  ) {
    const vendor = await this.getOwnVendor(user);
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: any = { vendorId: vendor.id };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.orderItem.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true,
              createdAt: true,
              shippingAddress: true,
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          product: {
            select: { name: true, slug: true, images: { take: 1 } },
          },
          variant: { select: { size: true, color: true, sku: true } },
        },
        skip,
        take: limit,
        orderBy: { order: { createdAt: 'desc' } },
      }),
      this.prisma.orderItem.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateOrderItemStatus(
    user: AuthUser,
    orderItemId: string,
    status: string,
  ) {
    const vendor = await this.getOwnVendor(user);
    const item = await this.prisma.orderItem.findFirst({
      where: { id: orderItemId, vendorId: vendor.id },
      include: { order: true },
    });
    if (!item) throw new NotFoundException('Order item not found');

    const allowed = [
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];
    if (!allowed.includes(status)) {
      throw new BadRequestException('Invalid status transition');
    }

    const updated = await this.prisma.orderItem.update({
      where: { id: orderItemId },
      data: { status: status as any },
    });

    await this.notificationsService.createNotification(item.order.userId, {
      title: 'Order update',
      body: `Your order ${item.order.orderNumber} has been updated to ${status.replace(/_/g, ' ').toLowerCase()}.`,
      type: 'ORDER_UPDATE',
    });

    return { item: updated };
  }

  async updateProfile(user: AuthUser, dto: UpdateVendorProfileDto) {
    const vendor = await this.getOwnVendor(user);
    const updated = await this.prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        name: dto.name,
        description: dto.description,
        logoUrl: dto.logoUrl,
        bannerUrl: dto.bannerUrl,
        socialLinks: dto.socialLinks as any,
      },
    });
    return { vendor: updated };
  }

  async getProfile(user: AuthUser) {
    const vendor = await this.getOwnVendor(user);
    return { vendor };
  }

  // ---------------------------------------------------------------
  // Admin vendor management
  // ---------------------------------------------------------------
  async updateVendorStatus(vendorId: string, dto: UpdateVendorStatusDto) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const updated = await this.prisma.vendor.update({
      where: { id: vendorId },
      data: { status: dto.status as any },
    });

    // If approved, promote user role to VENDOR
    if (dto.status === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: vendor.userId },
        data: { role: 'VENDOR' },
      });
    }

    const messages: Record<string, string> = {
      APPROVED: 'Your vendor application has been approved. Your store is now live.',
      REJECTED: `Your vendor application was rejected. ${dto.reason || ''}`.trim(),
      SUSPENDED: 'Your vendor store has been suspended. Please contact support.',
    };
    await this.notificationsService.createNotification(vendor.userId, {
      title: `Vendor application ${dto.status.toLowerCase()}`,
      body: messages[dto.status] || 'Your vendor status was updated.',
      type: 'VENDOR_STATUS',
    });

    return { vendor: updated };
  }
}
