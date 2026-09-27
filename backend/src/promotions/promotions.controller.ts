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
import { PromotionsService } from './promotions.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('promotions')
export class PromotionsController {
  constructor(private promotionsService: PromotionsService) {}

  // ---------------------------------------------------------------
  // Public
  // ---------------------------------------------------------------
  @Get()
  getActive() {
    return this.promotionsService.getActivePromotions();
  }

  // ---------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  getAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.promotionsService.getAllPromotions({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  create(@Body() body: any) {
    return this.promotionsService.createPromotion(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() body: any) {
    return this.promotionsService.updatePromotion(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string) {
    return this.promotionsService.deletePromotion(id);
  }

  // ---------------------------------------------------------------
  // Coupons (admin)
  // ---------------------------------------------------------------
  @Get('admin/coupons')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  getCoupons(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.promotionsService.getCoupons({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Post('admin/coupons')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  createCoupon(@Body() body: any) {
    return this.promotionsService.createCoupon(body);
  }

  @Delete('admin/coupons/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  deleteCoupon(@Param('id') id: string) {
    return this.promotionsService.deleteCoupon(id);
  }
}
