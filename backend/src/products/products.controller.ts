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
import { ProductsService } from './products.service';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateVariantStockDto,
  VariantDto,
} from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ---------------------------------------------------------------
  // Public endpoints
  // ---------------------------------------------------------------
  @Get()
  getProducts(
    @Query('search') search?: string,
    @Query('sport') sport?: string,
    @Query('type') type?: string,
    @Query('brand') brand?: string,
    @Query('vendor') vendor?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('size') size?: string,
    @Query('color') color?: string,
    @Query('minRating') minRating?: string,
    @Query('inStock') inStock?: string,
    @Query('onSale') onSale?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.getProducts({
      search,
      sport,
      type,
      brand,
      vendor,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      size,
      color,
      minRating: minRating ? parseFloat(minRating) : undefined,
      inStock,
      onSale,
      sort,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
    });
  }

  @Get('featured')
  getFeatured() {
    return this.productsService.getFeatured();
  }

  @Get('new-arrivals')
  getNewArrivals() {
    return this.productsService.getNewArrivals();
  }

  @Get('trending')
  getTrending() {
    return this.productsService.getTrending();
  }

  @Get(':slug')
  getProduct(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }

  @Get(':id/related')
  getRelated(@Param('id') id: string) {
    return this.productsService.getRelatedProducts(id);
  }

  // ---------------------------------------------------------------
  // Vendor product management
  // ---------------------------------------------------------------
  @Get('vendor/me')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  getMyProducts(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.getVendorProducts(user, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
      search,
    });
  }

  @Post('vendor/me')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  createProduct(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.productsService.createProduct(user, dto);
  }

  @Patch('vendor/me/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  updateProduct(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(user, id, dto);
  }

  @Delete('vendor/me/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  deleteProduct(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productsService.deleteProduct(user, id);
  }

  @Post('vendor/me/:id/images')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  addImage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { url: string },
  ) {
    return this.productsService.addProductImage(user, id, body.url);
  }

  @Delete('vendor/me/:id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  removeImage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.removeProductImage(user, id, imageId);
  }

  @Patch('vendor/me/:id/images/:imageId/primary')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  setPrimaryImage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.setPrimaryImage(user, id, imageId);
  }

  @Post('vendor/me/:id/variants')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  addVariant(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: VariantDto,
  ) {
    return this.productsService.addVariant(user, id, dto);
  }

  @Patch('vendor/me/:id/variants/:variantId/stock')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  updateVariantStock(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantStockDto,
  ) {
    return this.productsService.updateVariantStock(user, id, variantId, dto);
  }

  @Delete('vendor/me/:id/variants/:variantId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.VENDOR)
  removeVariant(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ) {
    return this.productsService.removeVariant(user, id, variantId);
  }
}
