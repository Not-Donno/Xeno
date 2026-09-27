import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {}

  // ---------------------------------------------------------------
  // Public: product reviews
  // ---------------------------------------------------------------
  async getProductReviews(
    productId: string,
    params: { page?: number; limit?: number; rating?: number },
  ) {
    const { page = 1, limit = 10, rating } = params;
    const skip = (page - 1) * limit;

    const where: any = { productId, status: 'APPROVED' };
    if (rating) where.rating = rating;

    const [reviews, total, distribution] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
          response: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { productId, status: 'APPROVED' },
        _count: { rating: true },
      }),
    ]);

    const distMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      distMap[d.rating] = d._count.rating;
    });

    return { reviews, total, page, totalPages: Math.ceil(total / limit), distribution: distMap };
  }

  // ---------------------------------------------------------------
  // Create review (verified purchase required)
  // ---------------------------------------------------------------
  async createReview(
    user: AuthUser,
    productId: string,
    data: { rating: number; title?: string; body: string },
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { vendor: { select: { id: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Check for existing review
    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // Verify purchase
    const purchased = await this.ordersService.hasPurchasedProduct(
      user.id,
      productId,
    );
    if (!purchased) {
      throw new ForbiddenException(
        'Only customers who purchased this product can leave a review',
      );
    }

    const review = await this.prisma.review.create({
      data: {
        productId,
        userId: user.id,
        vendorId: product.vendor.id,
        rating: data.rating,
        title: data.title,
        body: data.body,
        status: 'APPROVED',
      },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    // Update product rating aggregate
    await this.recalculateProductRating(productId);

    return { review };
  }

  async updateReview(
    user: AuthUser,
    reviewId: string,
    data: { rating?: number; title?: string; body?: string },
  ) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, userId: user.id },
    });
    if (!review) throw new NotFoundException('Review not found');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        title: data.title,
        body: data.body,
      },
    });

    await this.recalculateProductRating(review.productId);
    return { review: updated };
  }

  async deleteReview(user: AuthUser, reviewId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, userId: user.id },
    });
    if (!review) throw new NotFoundException('Review not found');

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this.recalculateProductRating(review.productId);
    return { success: true };
  }

  // ---------------------------------------------------------------
  // Vendor response
  // ---------------------------------------------------------------
  async respondToReview(
    user: AuthUser,
    reviewId: string,
    body: string,
  ) {
    if (!user.vendorId) {
      throw new ForbiddenException('Only vendors can respond to reviews');
    }

    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, vendorId: user.vendorId },
    });
    if (!review) throw new NotFoundException('Review not found');

    const existing = await this.prisma.reviewResponse.findUnique({
      where: { reviewId },
    });
    if (existing) {
      throw new BadRequestException('You have already responded to this review');
    }

    const response = await this.prisma.reviewResponse.create({
      data: { reviewId, body },
    });
    return { response };
  }

  // ---------------------------------------------------------------
  // Admin moderation
  // ---------------------------------------------------------------
  async moderateReview(reviewId: string, status: 'APPROVED' | 'REJECTED') {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });
    await this.recalculateProductRating(review.productId);
    return { review: updated };
  }

  async getAllReviews(params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          product: { select: { name: true, slug: true } },
          vendor: { select: { name: true, slug: true } },
          response: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { reviews, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
  private async recalculateProductRating(productId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round((agg._avg.rating || 0) * 10) / 10,
        reviewCount: agg._count.rating,
      },
    });

    // Also update vendor rating
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { vendorId: true },
    });
    if (product) {
      const vendorAgg = await this.prisma.review.aggregate({
        where: { vendorId: product.vendorId, status: 'APPROVED' },
        _avg: { rating: true },
      });
      await this.prisma.vendor.update({
        where: { id: product.vendorId },
        data: { rating: Math.round((vendorAgg._avg.rating || 0) * 10) / 10 },
      });
    }
  }
}
