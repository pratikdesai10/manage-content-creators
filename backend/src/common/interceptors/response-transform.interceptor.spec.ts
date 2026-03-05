import { ResponseTransformInterceptor } from './response-transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

function makeContext(traceId = 'abc-123'): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ traceId }),
    }),
  } as unknown as ExecutionContext;
}

describe('ResponseTransformInterceptor', () => {
  it('should wrap response with success, data, timestamp, and traceId', (done) => {
    const interceptor = new ResponseTransformInterceptor();
    const handler: CallHandler = { handle: () => of({ name: 'test' }) };

    interceptor.intercept(makeContext('trace-xyz'), handler).subscribe({
      next: (result) => {
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ name: 'test' });
        expect(result.traceId).toBe('trace-xyz');
        expect(typeof result.timestamp).toBe('string');
        done();
      },
    });
  });
});
