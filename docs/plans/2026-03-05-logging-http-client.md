# Logging, HTTP Client & Trace-ID Propagation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add trace-ID propagation, structured request/response logging, and a reusable Axios-based HTTP client to the NestJS backend.

**Architecture:** Use NestJS REQUEST-scoped providers so the trace-ID stored on `req.traceId` flows naturally through `LoggingInterceptor` → `ResponseTransformInterceptor` → `HttpExceptionFilter` → `HttpClientService`. Global interceptors/filters are registered via `AppModule` providers (not `main.ts`) to support DI and REQUEST scope.

**Tech Stack:** NestJS 11, RxJS, Axios, Express (via `@nestjs/platform-express`), NestJS `Logger` (built-in)

---

## Important Notes Before Starting

- **REQUEST scope cascade**: Any provider that injects `REQUEST` becomes REQUEST-scoped. This is intentional — `LoggingInterceptor`, `ResponseTransformInterceptor`, `HttpExceptionFilter`, and `HttpClientService` all need `req.traceId`.
- **Global registration via AppModule**: `app.useGlobalInterceptors()` and `app.useGlobalFilters()` in `main.ts` don't support DI. To keep REQUEST scope working, register them as providers in `AppModule` using `APP_INTERCEPTOR` and `APP_FILTER` tokens.
- **Express Request type extension**: We extend the Express `Request` type to add `traceId: string` via a declaration merge in a shared types file.
- **Axios**: Not currently installed — must be added (`npm install axios`).

---

## Task 1: Install Axios and extend Express Request type

**Files:**
- Modify: `backend/package.json` (via npm install)
- Create: `backend/src/common/types/express.d.ts`

**Step 1: Install axios**

```bash
cd backend
npm install axios
```

Expected: `axios` appears in `dependencies` in `package.json`.

**Step 2: Create Express Request type extension**

Create `backend/src/common/types/express.d.ts`:

```ts
declare namespace Express {
  interface Request {
    traceId: string;
  }
}
```

This lets TypeScript know `req.traceId` is valid everywhere without casting.

**Step 3: Verify TypeScript is happy**

```bash
cd backend
npm run build
```

Expected: Builds without errors.

**Step 4: Commit**

```bash
git add backend/src/common/types/express.d.ts backend/package.json backend/package-lock.json
git commit -m "feat(backend): install axios and extend Express Request with traceId"
```

---

## Task 2: Create LoggingInterceptor

**Files:**
- Create: `backend/src/common/interceptors/logging.interceptor.ts`
- Create: `backend/src/common/interceptors/logging.interceptor.spec.ts`

**Step 1: Write the failing test**

Create `backend/src/common/interceptors/logging.interceptor.spec.ts`:

```ts
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

function makeContext(overrides: Partial<{ traceId: string; method: string; url: string }> = {}): ExecutionContext {
  const req = {
    traceId: overrides.traceId ?? 'test-trace-id',
    method: overrides.method ?? 'GET',
    url: overrides.url ?? '/test',
  };
  return {
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
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern=logging.interceptor.spec
```

Expected: FAIL — `LoggingInterceptor` not found.

**Step 3: Implement LoggingInterceptor**

Create `backend/src/common/interceptors/logging.interceptor.ts`:

```ts
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
      (req.headers['x-trace-id'] as string) ?? crypto.randomUUID();
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
```

**Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern=logging.interceptor.spec
```

Expected: All 3 tests PASS.

**Step 5: Commit**

```bash
git add backend/src/common/interceptors/logging.interceptor.ts backend/src/common/interceptors/logging.interceptor.spec.ts
git commit -m "feat(backend): add LoggingInterceptor with trace-ID generation"
```

---

## Task 3: Enhance ResponseTransformInterceptor with traceId

**Files:**
- Modify: `backend/src/common/interceptors/response-transform.interceptor.ts`
- Create: `backend/src/common/interceptors/response-transform.interceptor.spec.ts`

**Step 1: Write the failing test**

Create `backend/src/common/interceptors/response-transform.interceptor.spec.ts`:

```ts
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
```

**Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern=response-transform.interceptor.spec
```

Expected: FAIL — `traceId` is undefined in result.

**Step 3: Update ResponseTransformInterceptor**

Replace `backend/src/common/interceptors/response-transform.interceptor.ts` entirely:

```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  traceId: string;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        traceId: req.traceId ?? '',
      })),
    );
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern=response-transform.interceptor.spec
```

Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/common/interceptors/response-transform.interceptor.ts backend/src/common/interceptors/response-transform.interceptor.spec.ts
git commit -m "feat(backend): add traceId to response envelope in ResponseTransformInterceptor"
```

---

## Task 4: Enhance HttpExceptionFilter with traceId

**Files:**
- Modify: `backend/src/common/filters/http-exception.filter.ts`
- Create: `backend/src/common/filters/http-exception.filter.spec.ts`

**Step 1: Write the failing test**

Create `backend/src/common/filters/http-exception.filter.spec.ts`:

```ts
import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

function makeHost(traceId = 'err-trace', url = '/test'): ArgumentsHost {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url, traceId }),
    }),
  } as unknown as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
  it('should include traceId in error response', () => {
    const filter = new HttpExceptionFilter();
    const host = makeHost('my-trace', '/fail');
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    const statusMock = (host.switchToHttp().getResponse() as any).status;
    const jsonMock = statusMock.mock.results[0].value.json;
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ traceId: 'my-trace' }),
    );
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern=http-exception.filter.spec
```

Expected: FAIL — `traceId` missing from response.

**Step 3: Update HttpExceptionFilter**

Replace `backend/src/common/filters/http-exception.filter.ts` entirely:

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      traceId: request.traceId ?? '',
    });
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern=http-exception.filter.spec
```

Expected: PASS.

**Step 5: Commit**

```bash
git add backend/src/common/filters/http-exception.filter.ts backend/src/common/filters/http-exception.filter.spec.ts
git commit -m "feat(backend): add traceId to error response in HttpExceptionFilter"
```

---

## Task 5: Register interceptors and filter globally via AppModule

**Files:**
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/main.ts`

**Step 1: Update AppModule to register global interceptors and filter**

`main.ts` `useGlobalInterceptors`/`useGlobalFilters` don't support DI, so move global registration to `AppModule` using `APP_INTERCEPTOR` and `APP_FILTER` tokens from `@nestjs/core`.

Replace `backend/src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CreatorModule } from './creator/creator.module';
import { AgencyModule } from './agency/agency.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    CreatorModule,
    AgencyModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
```

**Step 2: Remove manual global registrations from main.ts**

Replace `backend/src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression = require('compression');
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CollabHub API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
```

**Step 3: Verify build passes**

```bash
cd backend
npm run build
```

Expected: Compiles without errors.

**Step 4: Commit**

```bash
git add backend/src/app.module.ts backend/src/main.ts
git commit -m "feat(backend): register LoggingInterceptor, ResponseTransformInterceptor, HttpExceptionFilter globally via AppModule"
```

---

## Task 6: Create HttpClientConfig abstract class

**Files:**
- Create: `backend/src/common/http/http-client.config.ts`

**Step 1: Create the abstract config class**

Create `backend/src/common/http/http-client.config.ts`:

```ts
export abstract class HttpClientConfig {
  abstract getBaseUrl(): string;
  abstract getServiceName(): string;
  abstract getAdditionalHeaders(): Record<string, string>;
}
```

No test needed — it's an abstract class with no logic.

**Step 2: Commit**

```bash
git add backend/src/common/http/http-client.config.ts
git commit -m "feat(backend): add HttpClientConfig abstract class"
```

---

## Task 7: Create HttpClientService

**Files:**
- Create: `backend/src/common/http/http-client.service.ts`
- Create: `backend/src/common/http/http-client.service.spec.ts`

**Step 1: Write the failing test**

Create `backend/src/common/http/http-client.service.spec.ts`:

```ts
import { HttpClientService } from './http-client.service';
import { HttpClientConfig } from './http-client.config';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

class TestConfig extends HttpClientConfig {
  getBaseUrl() { return 'https://api.example.com'; }
  getServiceName() { return 'TestService'; }
  getAdditionalHeaders() { return { 'X-Custom': 'value' }; }
}

function makeReq(traceId = 'trace-123') {
  return { traceId };
}

describe('HttpClientService', () => {
  let service: HttpClientService;

  beforeEach(() => {
    service = new HttpClientService(new TestConfig(), makeReq() as any);
  });

  afterEach(() => jest.clearAllMocks());

  it('should make a GET request with traceId and custom headers', async () => {
    mockedAxios.request = jest.fn().mockResolvedValue({ status: 200, data: { ok: true } });

    const result = await service.get('/users');

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: expect.objectContaining({
          'X-Trace-Id': 'trace-123',
          'X-Custom': 'value',
        }),
      }),
    );
    expect(result.data).toEqual({ ok: true });
  });

  it('should make a POST request with body', async () => {
    mockedAxios.request = jest.fn().mockResolvedValue({ status: 201, data: { id: 1 } });

    await service.post('/users', { name: 'Alice' });

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.example.com/users',
        data: { name: 'Alice' },
      }),
    );
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend
npm test -- --testPathPattern=http-client.service.spec
```

Expected: FAIL — `HttpClientService` not found.

**Step 3: Implement HttpClientService**

Create `backend/src/common/http/http-client.service.ts`:

```ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request } from 'express';
import { HttpClientConfig } from './http-client.config';

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger('HttpClient');

  constructor(
    private readonly config: HttpClientConfig,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async get<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.execute<T>('GET', path, undefined, config);
  }

  async post<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.execute<T>('POST', path, data, config);
  }

  async put<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.execute<T>('PUT', path, data, config);
  }

  async patch<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.execute<T>('PATCH', path, data, config);
  }

  async delete<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.execute<T>('DELETE', path, undefined, config);
  }

  private async execute<T>(
    method: string,
    path: string,
    data?: unknown,
    extraConfig?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const traceId = this.request.traceId ?? '';
    const serviceName = this.config.getServiceName();
    const url = `${this.config.getBaseUrl()}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.config.getAdditionalHeaders(),
      'X-Trace-Id': traceId,
      ...extraConfig?.headers,
    };

    const start = Date.now();
    this.logger.log({ traceId, serviceName, method, url });

    try {
      const response = await axios.request<T>({
        method,
        url,
        data,
        headers,
        ...extraConfig,
      });
      const durationMs = Date.now() - start;
      this.logger.log({ traceId, serviceName, statusCode: response.status, durationMs });
      return response;
    } catch (err: unknown) {
      const durationMs = Date.now() - start;
      const statusCode = (err as any)?.response?.status ?? 0;
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error({ traceId, serviceName, statusCode, errorMessage, durationMs });
      throw err;
    }
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd backend
npm test -- --testPathPattern=http-client.service.spec
```

Expected: Both tests PASS.

**Step 5: Commit**

```bash
git add backend/src/common/http/http-client.service.ts backend/src/common/http/http-client.service.spec.ts
git commit -m "feat(backend): add HttpClientService with trace-ID forwarding and logging"
```

---

## Task 8: Create HttpClientModule and barrel export

**Files:**
- Create: `backend/src/common/http/http-client.module.ts`
- Create: `backend/src/common/http/index.ts`

**Step 1: Create HttpClientModule**

Create `backend/src/common/http/http-client.module.ts`:

```ts
import { Global, Module } from '@nestjs/common';
import { HttpClientService } from './http-client.service';

@Global()
@Module({
  providers: [HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {}
```

**Step 2: Create barrel export**

Create `backend/src/common/http/index.ts`:

```ts
export { HttpClientConfig } from './http-client.config';
export { HttpClientService } from './http-client.service';
export { HttpClientModule } from './http-client.module';
```

**Step 3: Verify build**

```bash
cd backend
npm run build
```

Expected: Compiles without errors.

**Step 4: Commit**

```bash
git add backend/src/common/http/http-client.module.ts backend/src/common/http/index.ts
git commit -m "feat(backend): add HttpClientModule and barrel export"
```

---

## Task 9: Run all tests and verify everything passes

**Step 1: Run full test suite**

```bash
cd backend
npm test
```

Expected: All tests pass, no failures.

**Step 2: Run build one final time**

```bash
cd backend
npm run build
```

Expected: Clean build with no TypeScript errors.

**Step 3: Start dev server and smoke test**

```bash
cd backend
npm run start:dev
```

Hit any endpoint (e.g. `POST /auth/login`) and verify:
- Response includes `traceId` field
- Terminal shows structured log lines with `traceId`, `method`, `url`, `statusCode`, `durationMs`
- If `X-Trace-Id` header is sent in the request, that same ID appears in the response

---

## Summary of New/Modified Files

| File | Action |
|------|--------|
| `backend/src/common/types/express.d.ts` | NEW — extends `Request` with `traceId` |
| `backend/src/common/interceptors/logging.interceptor.ts` | NEW — logs incoming/outgoing, sets `req.traceId` |
| `backend/src/common/interceptors/logging.interceptor.spec.ts` | NEW — tests |
| `backend/src/common/interceptors/response-transform.interceptor.ts` | MODIFIED — adds `traceId` to envelope |
| `backend/src/common/interceptors/response-transform.interceptor.spec.ts` | NEW — tests |
| `backend/src/common/filters/http-exception.filter.ts` | MODIFIED — adds `traceId` to error response |
| `backend/src/common/filters/http-exception.filter.spec.ts` | NEW — tests |
| `backend/src/common/http/http-client.config.ts` | NEW — abstract config base class |
| `backend/src/common/http/http-client.service.ts` | NEW — Axios wrapper with logging |
| `backend/src/common/http/http-client.service.spec.ts` | NEW — tests |
| `backend/src/common/http/http-client.module.ts` | NEW — global NestJS module |
| `backend/src/common/http/index.ts` | NEW — barrel export |
| `backend/src/app.module.ts` | MODIFIED — registers interceptors/filter via APP_INTERCEPTOR/APP_FILTER |
| `backend/src/main.ts` | MODIFIED — removes manual global interceptor/filter registration |
