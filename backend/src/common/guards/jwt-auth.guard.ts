import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Allow optional auth: if no token, request.user stays undefined and
    // handlers that require auth use @RequireAuth() decorator.
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers['authorization'] || '';
    if (!authHeader.startsWith('Bearer ')) {
      return true;
    }
    return super.canActivate(context);
  }
}
