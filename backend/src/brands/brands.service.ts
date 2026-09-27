import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  }

  async getBrands(search?: string) {
    const brands = await this.prisma.brand.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
    return { brands };
  }

  async getBrandBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return { brand };
  }

  async createBrand(name: string) {
    const slug = this.slugify(name);
    const existing = await this.prisma.brand.findUnique({ where: { slug } });
    if (existing) throw new BadRequestException('Brand already exists');
    const brand = await this.prisma.brand.create({ data: { name, slug } });
    return { brand };
  }

  async updateBrand(id: string, name: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    const slug = this.slugify(name);
    const updated = await this.prisma.brand.update({
      where: { id },
      data: { name, slug },
    });
    return { brand: updated };
  }

  async deleteBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    const count = await this.prisma.product.count({
      where: { brandId: id },
    });
    if (count > 0) {
      throw new BadRequestException(`Cannot delete: ${count} products use this brand`);
    }
    await this.prisma.brand.delete({ where: { id } });
    return { success: true };
  }
}
