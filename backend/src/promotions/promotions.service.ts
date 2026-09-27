import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async getActivePromotions() {
    const now = new Date();
    const promotions = await this.prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: null },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
    return { promotions };
  }

  async getAllPromotions(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [promotions, total] = await Promise.all([
      this.prisma.promotion.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promotion.count(),
    ]);

    return { promotions, total, page, totalPages: Math.ceil(total / limit) };
  }

  async createPromotion(data: {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    startsAt?: string;
    endsAt?: string;
    sortOrder?: number;
  }) {
    const promotion = await this.prisma.promotion.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return { promotion };
  }

  async updatePromotion(
    id: string,
    data: {
      title?: string;
      subtitle?: string;
      imageUrl?: string;
      linkUrl?: string;
      startsAt?: string;
      endsAt?: string;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) throw new NotFoundException('Promotion not found');

    const updated = await this.prisma.promotion.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
    return { promotion: updated };
  }

  async deletePromotion(id: string) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) throw new NotFoundException('Promotion not found');
    await this.prisma.promotion.delete({ where: { id } });
    return { success: true };
  }

  // ---------------------------------------------------------------
  // Coupons
  // ---------------------------------------------------------------
  async getCoupons(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coupon.count(),
    ]);

    return { coupons, total, page, totalPages: Math.ceil(total / limit) };
  }

  async createCoupon(data: {
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrder?: number;
    maxUses?: number;
    startsAt: string;
    endsAt: string;
  }) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });
    if (existing) throw new BadRequestException('Coupon code already exists');

    const coupon = await this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        minOrder: data.minOrder,
        maxUses: data.maxUses,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
      },
    });
    return { coupon };
  }

  async deleteCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.prisma.coupon.delete({ where: { id } });
    return { success: true };
  }
}
