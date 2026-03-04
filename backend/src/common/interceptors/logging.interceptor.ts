import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const traceId: string =
      (req.headers?.['x-trace-id'] as string) ?? crypto.randomUUID();
    req.traceId = traceId;

    const { method, url } = req;
    const start = Date.now();

    this.logger.log({ traceId, method, url, timestamp: new Date().toISOString() });

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - start;
        this.logger.log({ traceId, method, url, statusCode: res.statusCode, durationMs });
      }),
      catchError((err: unknown) => {
        const durationMs = Date.now() - start;
        const statusCode =
          err instanceof Error && 'status' in err ? (err as any).status : 500;
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error({ traceId, method, url, statusCode, errorMessage, durationMs });
        throw err;
      }),
    );
  }
}
