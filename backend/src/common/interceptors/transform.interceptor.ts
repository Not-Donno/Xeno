import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
}

/**
 * Wraps successful responses in a consistent envelope.
 * Controllers can return raw data; the frontend receives { success, data, meta? }.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Don't double-wrap already-wrapped responses
        if (
          data &&
          typeof data === 'object' &&
          'success' in (data as any) &&
          'data' in (data as any)
        ) {
          return data as any;
        }
        return { success: true, data };
      }),
    );
  }
}
