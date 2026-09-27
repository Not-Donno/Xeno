import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from '../auth/dto/auth.dto';
import { CreateAddressDto, UpdateAddressDto, UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            bannerUrl: true,
            description: true,
            status: true,
            rating: true,
            totalSales: true,
            createdAt: true,
            _count: { select: { products: true } },
          },
        },
        addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] },
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, ...rest } = user as any;
    return { user: rest };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl,
      },
    });
    const { passwordHash, ...rest } = user as any;
    return { user: rest };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new NotFoundException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    // Invalidate all refresh tokens (force re-login)
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { success: true };
  }

  // ---------------------------------------------------------------
  // Addresses
  // ---------------------------------------------------------------
  async getAddresses(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return { addresses };
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const address = await this.prisma.address.create({
      data: { userId, ...dto },
    });
    return { address };
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }
    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
    return { address: updated };
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');
    await this.prisma.address.delete({ where: { id: addressId } });
    return { success: true };
  }
}
