import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthUser } from './current-user.decorator';

/**
 * Use on public endpoints that need the user only when a valid token exists.
 * Throws 401 when an invalid/expired token was provided.
 */
export const OptionalUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? null;
  },
);

/**
 * Use inside JwtAuthGuard-protected controllers to force authentication.
 */
export function requireUser(user: AuthUser | undefined | null): AuthUser {
  if (!user) {
    throw new UnauthorizedException('Authentication required');
  }
  return user;
}
