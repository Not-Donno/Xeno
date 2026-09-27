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
import { BrandsService } from './brands.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Get()
  getBrands(@Query('search') search?: string) {
    return this.brandsService.getBrands(search);
  }

  @Get(':slug')
  getBrand(@Param('slug') slug: string) {
    return this.brandsService.getBrandBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  createBrand(@Body() body: { name: string }) {
    return this.brandsService.createBrand(body.name);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  updateBrand(@Param('id') id: string, @Body() body: { name: string }) {
    return this.brandsService.updateBrand(id, body.name);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  deleteBrand(@Param('id') id: string) {
    return this.brandsService.deleteBrand(id);
  }
}
