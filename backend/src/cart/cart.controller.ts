import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthUser) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  addItem(
    @CurrentUser() user: AuthUser,
    @Body() body: { variantId: string; quantity?: number },
  ) {
    return this.cartService.addItem(user.id, body.variantId, body.quantity ?? 1);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateItem(user.id, id, body.quantity);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cartService.removeItem(user.id, id);
  }

  @Post('items/:id/save-for-later')
  saveForLater(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cartService.saveForLater(user.id, id);
  }

  @Post('items/:id/move-to-cart')
  moveToCart(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cartService.moveToCart(user.id, id);
  }

  @Delete()
  clearCart(@CurrentUser() user: AuthUser) {
    return this.cartService.clearCart(user.id);
  }
}
