import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  // ---------------------------------------------------------------
  // Registration
  // ---------------------------------------------------------------
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });

    // Create empty cart + wishlist for the new user
    await this.prisma.cart.create({ data: { userId: user.id } });
    await this.prisma.wishlist.create({ data: { userId: user.id } });

    await this.createVerificationToken(user.id, user.email, 'EMAIL_VERIFICATION');

    return {
      user: this.sanitizeUser(user),
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  // ---------------------------------------------------------------
  // Login / token issuance
  // ---------------------------------------------------------------
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { vendor: { select: { id: true } } },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: { include: { vendor: { select: { id: true } } } } },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Rotation: delete the used token and issue a new pair
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const user = stored.user;
    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    return { success: true };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { success: true };
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email, role },
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
    );

    const refreshToken = randomBytes(48).toString('hex');
    const refreshExpiresDays = this.parseDays(
      process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    );
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + refreshExpiresDays * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    };
  }

  private parseDays(value: string): number {
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) return 7;
    if (value.endsWith('m')) return num / (24 * 60);
    if (value.endsWith('h')) return num / 24;
    return num; // days
  }

  // ---------------------------------------------------------------
  // Email verification
  // ---------------------------------------------------------------
  private async createVerificationToken(
    userId: string,
    email: string,
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET',
  ) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await this.prisma.verificationToken.create({
      data: { userId, token, type, expiresAt },
    });

    // In production this would send an email. For development we log it and
    // expose it via the API response when NODE_ENV !== 'production'.
    // eslint-disable-next-line no-console
    console.log(`[XENO] ${type} token for ${email}: ${token}`);
    return token;
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token: dto.token },
    });

    if (!record || record.type !== 'EMAIL_VERIFICATION' || record.usedAt) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.prisma.$transaction([
      this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
    ]);

    return { success: true, message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user || user.emailVerified) return { success: true };
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: 'EMAIL_VERIFICATION', usedAt: null },
    });
    await this.createVerificationToken(user.id, user.email, 'EMAIL_VERIFICATION');
    return { success: true };
  }

  // ---------------------------------------------------------------
  // Password reset
  // ---------------------------------------------------------------
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    // Always return success to avoid email enumeration
    if (!user) return { success: true };

    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id, type: 'PASSWORD_RESET', usedAt: null },
    });
    await this.createVerificationToken(user.id, user.email, 'PASSWORD_RESET');
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token: dto.token },
    });

    if (!record || record.type !== 'PASSWORD_RESET' || record.usedAt) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.$transaction([
      this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      // Invalidate all existing sessions
      this.prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return { success: true, message: 'Password reset successfully' };
  }

  // ---------------------------------------------------------------
  // Current user profile
  // ---------------------------------------------------------------
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            status: true,
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return { user: this.sanitizeUser(user) };
  }

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
  sanitizeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      vendor: user.vendor
        ? { id: user.vendor.id, name: user.vendor.name, slug: user.vendor.slug }
        : null,
      createdAt: user.createdAt,
    };
  }
}
