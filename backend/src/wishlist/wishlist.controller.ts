import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  getWishlist(@CurrentUser() user: AuthUser) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post(':productId')
  addItem(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.wishlistService.addItem(user.id, productId);
  }

  @Delete(':productId')
  removeItem(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.wishlistService.removeItem(user.id, productId);
  }

  @Post(':productId/toggle')
  toggleItem(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.wishlistService.toggleItem(user.id, productId);
  }
}
