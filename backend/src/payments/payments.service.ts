import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Payment provider abstraction.
 *
 * The platform never stores raw card data. A "test" provider is implemented
 * for development; production integrations (Stripe, PayPal, etc.) can be
 * added behind the same interface by implementing PaymentProvider and
 * registering it based on PAYMENT_PROVIDER env var.
 */

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
}

export interface PaymentProvider {
  name: string;
  charge(input: {
    amount: number;
    currency: string;
    orderId: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentResult>;
}

/** Development/test provider — always succeeds, never touches real money. */
export class TestPaymentProvider implements PaymentProvider {
  name = 'test';

  async charge(input: {
    amount: number;
    currency: string;
    orderId: string;
  }): Promise<PaymentResult> {
    if (input.amount <= 0) {
      return { success: false, message: 'Invalid amount' };
    }
    return {
      success: true,
      transactionId: `test_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    };
  }
}

@Injectable()
export class PaymentsService {
  private provider: PaymentProvider;

  constructor(private prisma: PrismaService) {
    // Only the test provider is implemented; swap with a real one via env.
    this.provider = new TestPaymentProvider();
  }

  async processOrderPayment(orderId: string, method: string = 'test') {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }

    const result = await this.provider.charge({
      amount: order.total,
      currency: 'USD',
      orderId: order.id,
    });

    if (!result.success) {
      await this.prisma.payment.create({
        data: {
          orderId,
          amount: order.total,
          method,
          status: 'FAILED',
        },
      });
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
      throw new BadRequestException(result.message || 'Payment failed');
    }

    await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          orderId,
          amount: order.total,
          method,
          status: 'PAID',
          transactionId: result.transactionId,
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' },
      }),
    ]);

    return {
      success: true,
      transactionId: result.transactionId,
      message: 'Payment successful',
    };
  }

  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    return { payment };
  }
}
