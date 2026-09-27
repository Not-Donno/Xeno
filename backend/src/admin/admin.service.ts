import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VendorStatus, Role, OrderStatus, ProductStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCustomers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingVendors,
      pendingOrders,
      recentOrders,
      recentUsers,
      topProducts,
      topVendors,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.vendor.count({ where: { status: VendorStatus.APPROVED } }),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
      this.prisma.vendor.count({ where: { status: VendorStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.findMany({
        take: 10,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: {
            include: {
              product: { select: { name: true } },
              vendor: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.findMany({
        take: 10,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.findMany({
        take: 10,
        where: { status: ProductStatus.ACTIVE },
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
      }),
      this.prisma.vendor.findMany({
        take: 10,
        where: { status: VendorStatus.APPROVED },
        select: {
          id: true,
          name: true,
          slug: true,
          totalSales: true,
          rating: true,
          logoUrl: true,
        },
        orderBy: { totalSales: 'desc' },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        totalCustomers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        pendingVendors,
        pendingOrders,
      },
      recentOrders,
      recentUsers,
      topProducts,
      topVendors,
    };
  }

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
  }) {
    const { page = 1, limit = 20, search, role } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          vendor: { select: { name: true, slug: true, status: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateUser(
    userId: string,
    data: { role?: Role; isActive?: boolean },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === Role.ADMIN) {
      throw new NotFoundException('Cannot delete admin accounts');
    }
    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }

  async getAllVendors(params?: {
    page?: number;
    limit?: number;
    status?: VendorStatus;
  }) {
    const { page = 1, limit = 20, status } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          _count: { select: { products: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return { vendors, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  }) {
    const { page = 1, limit = 20, status } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: {
            include: {
              product: { select: { name: true } },
              vendor: { select: { name: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllProducts(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const { page = 1, limit = 20, status } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          brand: true,
          vendor: { select: { name: true, slug: true } },
          _count: { select: { reviews: true, variants: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateProductStatus(productId: string, status: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id: productId },
      data: { status: status as ProductStatus },
    });
  }

  async deleteProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id: productId } });
    return { success: true };
  }

  async getSalesAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
    const days =
      period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'PAID',
      },
      select: {
        total: true,
        createdAt: true,
        items: { select: { totalPrice: true } },
      },
    });

    const dailySales: Record<string, number> = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + order.total;
    });

    return {
      dailySales,
      totalRevenue: orders.reduce((s, o) => s + o.total, 0),
      orderCount: orders.length,
    };
  }

  // ---------------------------------------------------------------
  // Platform settings
  // ---------------------------------------------------------------
  async getSettings() {
    const settings = await this.prisma.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return { settings: map };
  }

  async updateSetting(key: string, value: string) {
    const setting = await this.prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return { setting };
  }
}
