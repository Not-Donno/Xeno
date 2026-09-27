import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: { savedForLater: false },
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                    vendor: { select: { id: true, name: true, slug: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const savedItems = await this.prisma.cartItem.findMany({
      where: { cart: { userId }, savedForLater: true },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                vendor: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = cart?.items ?? [];
    const subtotal = items.reduce((sum, item) => {
      const price = item.variant.price ?? item.variant.product.price;
      return sum + price * item.quantity;
    }, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      savedForLater: savedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount,
    };
  }

  async addItem(
    userId: string,
    variantId: string,
    quantity: number = 1,
  ) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!variant) throw new NotFoundException('Product variant not found');
    if (variant.product.status !== 'ACTIVE') {
      throw new BadRequestException('Product is not available');
    }
    if (variant.stock < quantity) {
      throw new BadRequestException(`Only ${variant.stock} items in stock`);
    }

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (variant.stock < newQty) {
        throw new BadRequestException(`Only ${variant.stock} items in stock`);
      }
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty, savedForLater: false },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, variantId, quantity },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: { variant: true },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      return this.getCart(userId);
    }

    if (item.variant.stock < quantity) {
      throw new BadRequestException(`Only ${item.variant.stock} items in stock`);
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async saveForLater(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { savedForLater: true },
    });
    return this.getCart(userId);
  }

  async moveToCart(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: { variant: true },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.variant.stock < item.quantity) {
      throw new BadRequestException(`Only ${item.variant.stock} items in stock`);
    }
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { savedForLater: false },
    });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id, savedForLater: false },
      });
    }
    return this.getCart(userId);
  }
}
