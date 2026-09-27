import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // ---------------------------------------------------------------
  // Public
  // ---------------------------------------------------------------
  @Get('product/:productId')
  getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('rating') rating?: string,
  ) {
    return this.reviewsService.getProductReviews(productId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      rating: rating ? parseInt(rating) : undefined,
    });
  }

  // ---------------------------------------------------------------
  // Customer
  // ---------------------------------------------------------------
  @Post('product/:productId')
  @UseGuards(JwtAuthGuard)
  createReview(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() body: { rating: number; title?: string; body: string },
  ) {
    return this.reviewsService.createReview(user, productId, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateReview(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { rating?: number; title?: string; body?: string },
  ) {
    return this.reviewsService.updateReview(user, id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteReview(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.reviewsService.deleteReview(user, id);
  }

  // ---------------------------------------------------------------
  // Vendor response
  // ---------------------------------------------------------------
  @Post(':id/respond')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  respondToReview(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { body: string },
  ) {
    return this.reviewsService.respondToReview(user, id, body.body);
  }

  // ---------------------------------------------------------------
  // Admin moderation
  // ---------------------------------------------------------------
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  getAllReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.reviewsService.getAllReviews({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }

  @Patch('admin/:id/moderate')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  moderateReview(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
  ) {
    return this.reviewsService.moderateReview(id, body.status);
  }
}
