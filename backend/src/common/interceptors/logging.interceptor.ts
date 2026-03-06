import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const rawTraceId = req.headers?.['x-trace-id'];
    const traceId: string =
      (Array.isArray(rawTraceId) ? rawTraceId[0] : rawTraceId) ??
      crypto.randomUUID();
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
          err instanceof HttpException ? err.getStatus() : 500;
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error({ traceId, method, url, statusCode, errorMessage, durationMs });
        throw err;
      }),
    );
  }
}
