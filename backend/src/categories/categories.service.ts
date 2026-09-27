import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  }

  async getCategories(type?: 'SPORT' | 'PRODUCT_TYPE') {
    const categories = await this.prisma.category.findMany({
      where: type ? { type } : undefined,
      include: {
        _count: { select: { sportProducts: true, typeProducts: true } },
      },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
    return { categories };
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { sportProducts: true, typeProducts: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return { category };
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = this.slugify(dto.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new BadRequestException('Category already exists');

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        type: dto.type,
        description: dto.description,
        icon: dto.icon,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return { category };
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        sortOrder: dto.sortOrder,
      },
    });
    return { category: updated };
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const productCount = await this.prisma.product.count({
      where: {
        OR: [
          { sportCategoryId: id },
          { productTypeId: id },
        ],
      },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete: ${productCount} products use this category`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }
}
