import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApplyVendorDto,
  UpdateVendorProfileDto,
  UpdateVendorStatusDto,
  VendorOrderItemStatusDto,
} from './dto/vendor.dto';

@Controller('vendors')
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  // ---------------------------------------------------------------
  // Public endpoints
  // ---------------------------------------------------------------
  @Get()
  getVendors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.vendorsService.getVendors({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
      search,
    });
  }

  @Get(':slug')
  getVendor(@Param('slug') slug: string) {
    return this.vendorsService.getVendorBySlug(slug);
  }

  @Get(':slug/products')
  getVendorProducts(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.vendorsService.getVendorProducts(slug, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
      sort,
      category,
      search,
    });
  }

  // ---------------------------------------------------------------
  // Vendor application (authenticated customers)
  // ---------------------------------------------------------------
  @Post('apply')
  @UseGuards(JwtAuthGuard)
  apply(@CurrentUser() user: AuthUser, @Body() dto: ApplyVendorDto) {
    return this.vendorsService.apply(user, dto);
  }

  // ---------------------------------------------------------------
  // Vendor dashboard (own store only)
  // ---------------------------------------------------------------
  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.vendorsService.getProfile(user);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  updateMyProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateVendorProfileDto) {
    return this.vendorsService.updateProfile(user, dto);
  }

  @Get('me/dashboard')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  getDashboard(@CurrentUser() user: AuthUser) {
    return this.vendorsService.getDashboard(user);
  }

  @Get('me/orders')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  getOrders(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.vendorsService.getVendorOrders(user, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }

  @Patch('me/orders/:orderItemId/status')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  updateOrderItemStatus(
    @CurrentUser() user: AuthUser,
    @Param('orderItemId') orderItemId: string,
    @Body() dto: VendorOrderItemStatusDto,
  ) {
    return this.vendorsService.updateOrderItemStatus(user, orderItemId, dto.status);
  }

  // ---------------------------------------------------------------
  // Admin vendor management
  // ---------------------------------------------------------------
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  updateVendorStatus(@Param('id') id: string, @Body() dto: UpdateVendorStatusDto) {
    return this.vendorsService.updateVendorStatus(id, dto);
  }
}
