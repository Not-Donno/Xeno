import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private prisma: PrismaService,
  ) {}

  @Post('orders/:orderId/pay')
  async payOrder(
    @CurrentUser() user: AuthUser,
    @Param('orderId') orderId: string,
    @Body() body: { method?: string },
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
    });
    if (!order) throw new BadRequestException('Order not found');

    return this.paymentsService.processOrderPayment(orderId, body.method ?? 'test');
  }

  @Get('orders/:orderId/status')
  async getStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }
}
