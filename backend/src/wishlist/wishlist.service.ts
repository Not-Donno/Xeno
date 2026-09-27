import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                vendor: { select: { id: true, name: true, slug: true } },
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                _count: { select: { reviews: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const items = wishlist?.items ?? [];
    return { items, count: items.length };
  }

  async addItem(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const wishlist = await this.prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existing = await this.prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    if (existing) {
      return this.getWishlist(userId);
    }

    await this.prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    });
    return this.getWishlist(userId);
  }

  async removeItem(userId: string, productId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
    });
    if (!wishlist) throw new NotFoundException('Wishlist not found');

    const item = await this.prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    if (!item) throw new NotFoundException('Item not in wishlist');

    await this.prisma.wishlistItem.delete({ where: { id: item.id } });
    return this.getWishlist(userId);
  }

  async toggleItem(userId: string, productId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
    });
    if (!wishlist) {
      return this.addItem(userId, productId);
    }
    const item = await this.prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    if (item) {
      await this.prisma.wishlistItem.delete({ where: { id: item.id } });
      return { added: false };
    }
    await this.prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    });
    return { added: true };
  }
}
