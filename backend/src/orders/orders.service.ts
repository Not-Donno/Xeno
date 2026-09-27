import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `XNO-${timestamp}-${random}`;
  }

  // ---------------------------------------------------------------
  // Checkout: create order from cart
  // ---------------------------------------------------------------
  async createOrder(user: AuthUser, dto: CreateOrderDto) {
    // Validate address belongs to user
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId: user.id },
    });
    if (!address) throw new NotFoundException('Address not found');

    // Get cart with items
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          where: { savedForLater: false },
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    vendor: { select: { id: true, name: true, userId: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        throw new BadRequestException(
          `"${item.variant.product.name}" only has ${item.variant.stock} items in stock`,
        );
      }
    }

    // Validate coupon
    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });
      if (!coupon || !coupon.isActive) {
        throw new BadRequestException('Invalid coupon code');
      }
      const now = new Date();
      if (coupon.startsAt > now || coupon.endsAt < now) {
        throw new BadRequestException('Coupon is not valid at this time');
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        throw new BadRequestException('Coupon has reached its usage limit');
      }

      const subtotal = cart.items.reduce((sum, item) => {
        const price = item.variant.price ?? item.variant.product.price;
        return sum + price * item.quantity;
      }, 0);

      if (coupon.minOrder && subtotal < coupon.minOrder) {
        throw new BadRequestException(
          `Coupon requires a minimum order of $${coupon.minOrder}`,
        );
      }

      discount =
        coupon.type === 'PERCENTAGE'
          ? (subtotal * coupon.value) / 100
          : Math.min(coupon.value, subtotal);
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant.price ?? item.variant.product.price;
      return sum + price * item.quantity;
    }, 0);

    const shippingFee = subtotal >= 100 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = Math.max(0, subtotal - discount + shippingFee + tax);

    // Create order with items (multi-vendor: each item keeps its vendorId)
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId: user.id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal: Math.round(subtotal * 100) / 100,
          discount: Math.round(discount * 100) / 100,
          shipping: shippingFee,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100,
          shippingAddress: {
            label: address.label,
            name: address.name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
          paymentMethod: dto.paymentMethod || 'test',
          notes: dto.notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.variant.productId,
              variantId: item.variant.id,
              vendorId: item.variant.product.vendorId,
              quantity: item.quantity,
              unitPrice: item.variant.price ?? item.variant.product.price,
              totalPrice:
                (item.variant.price ?? item.variant.product.price) *
                item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
              },
              variant: true,
              vendor: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variant.id },
          data: { stock: { decrement: item.quantity } },
        });
        // Increment product sales count
        await tx.product.update({
          where: { id: item.variant.productId },
          data: { salesCount: { increment: item.quantity } },
        });
        // Increment vendor total sales
        await tx.vendor.update({
          where: { id: item.variant.product.vendorId },
          data: { totalSales: { increment: item.quantity } },
        });
      }

      // Increment coupon usage
      if (dto.couponCode) {
        await tx.coupon.update({
          where: { code: dto.couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id, savedForLater: false },
      });

      return newOrder;
    });

    // Notify vendors
    const vendorIds = new Set(order.items.map((i) => i.vendorId));
    for (const vendorId of vendorIds) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { userId: true },
      });
      if (vendor) {
        await this.notificationsService.createNotification(vendor.userId, {
          title: 'New order received',
          body: `Order ${order.orderNumber} has been placed.`,
          type: 'NEW_ORDER',
        });
      }
    }

    return { order };
  }

  // ---------------------------------------------------------------
  // Customer order history
  // ---------------------------------------------------------------
  async getUserOrders(
    user: AuthUser,
    params: { page?: number; limit?: number; status?: string },
  ) {
    const { page = 1, limit = 10, status } = params;
    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                },
              },
              variant: { select: { size: true, color: true } },
              vendor: { select: { id: true, name: true, slug: true } },
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

  async getOrderById(user: AuthUser, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                vendor: { select: { id: true, name: true, slug: true } },
              },
            },
            variant: { select: { size: true, color: true, sku: true } },
            vendor: { select: { id: true, name: true, slug: true } },
          },
        },
        payment: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return { order };
  }

  // ---------------------------------------------------------------
  // Admin order management
  // ---------------------------------------------------------------
  async getAllOrders(params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = params;
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
              product: { select: { name: true, slug: true } },
              vendor: { select: { name: true, slug: true } },
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

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    // If cancelling, restore stock
    if (dto.status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await this.prisma.$transaction([
        ...order.items.map((item) =>
          this.prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          }),
        ),
        this.prisma.order.update({
          where: { id: orderId },
          data: { status: dto.status, paymentStatus: 'REFUNDED' },
        }),
      ]);
    } else {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: dto.status },
      });
    }

    await this.notificationsService.createNotification(order.userId, {
      title: 'Order status updated',
      body: `Your order ${order.orderNumber} is now ${dto.status.replace(/_/g, ' ').toLowerCase()}.`,
      type: 'ORDER_UPDATE',
    });

    const updated = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true } },
            variant: { select: { size: true, color: true } },
            vendor: { select: { name: true, slug: true } },
          },
        },
      },
    });
    return { order: updated };
  }

  // ---------------------------------------------------------------
  // Check if user purchased a product (for verified reviews)
  // ---------------------------------------------------------------
  async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: { in: ['DELIVERED', 'SHIPPED', 'OUT_FOR_DELIVERY'] } },
      },
    });
    return !!orderItem;
  }
}
