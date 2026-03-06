import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

function makeContext(overrides: Partial<{ traceId: string; method: string; url: string }> = {}): ExecutionContext {
  const req = {
    traceId: overrides.traceId ?? 'test-trace-id',
    method: overrides.method ?? 'GET',
    url: overrides.url ?? '/test',
  };
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => ({ statusCode: 200 }),
    }),
  } as unknown as ExecutionContext;
}

function makeHandler(value: unknown = {}): CallHandler {
  return { handle: () => of(value) };
}

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('should generate a traceId if not present on req', (done) => {
    const req: any = { method: 'GET', url: '/test' };
    const ctx = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    interceptor.intercept(ctx, makeHandler()).subscribe({
      complete: () => {
        expect(req.traceId).toBeDefined();
        expect(typeof req.traceId).toBe('string');
        done();
      },
    });
  });

  it('should preserve existing traceId from request headers', (done) => {
    const req: any = { method: 'GET', url: '/test', headers: { 'x-trace-id': 'existing-id' } };
    const ctx = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    interceptor.intercept(ctx, makeHandler()).subscribe({
      complete: () => {
        expect(req.traceId).toBe('existing-id');
        done();
      },
    });
  });

  it('should pass through the response value unchanged', (done) => {
    const ctx = makeContext();
    interceptor.intercept(ctx, makeHandler({ foo: 'bar' })).subscribe({
      next: (val) => {
        expect(val).toEqual({ foo: 'bar' });
        done();
      },
    });
  });

  it('should re-throw errors after logging', (done) => {
    const { throwError } = require('rxjs');
    const error = new Error('something failed');
    const ctx = makeContext();
    const errorHandler: CallHandler = { handle: () => throwError(() => error) };

    interceptor.intercept(ctx, errorHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
        done();
      },
    });
  });
});
