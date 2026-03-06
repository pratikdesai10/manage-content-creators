# Logging, HTTP Client & Trace-ID Propagation — Design

**Date:** 2026-03-05
**Branch:** feature/backend-auth
**Scope:** NestJS backend only

---

## Overview

Add structured logging, a reusable HTTP client wrapper, and end-to-end trace-ID propagation across all incoming requests, outbound service calls, and responses.

---

## 1. Trace-ID Flow

- `LoggingInterceptor` reads `X-Trace-Id` from incoming request headers; generates `crypto.randomUUID()` if absent.
- Trace-ID is stored on `req.traceId` (extending Express `Request` type).
- All REQUEST-scoped components read `req.traceId` via NestJS `REQUEST` token injection.
- Every outgoing response (success and error) includes `traceId` in the envelope.
- `HttpClientService` forwards `X-Trace-Id` header on every outbound call.

---

## 2. LoggingInterceptor

**File:** `src/common/interceptors/logging.interceptor.ts`
**Scope:** REQUEST-scoped, registered globally in `main.ts` before `ResponseTransformInterceptor`

**Incoming request log fields:**
- `traceId`, `method`, `url`, `timestamp`

**Outgoing response log fields (via `tap`):**
- `traceId`, `method`, `url`, `statusCode`, `durationMs`

**Error log fields (via `catchError`):**
- `traceId`, `method`, `url`, `statusCode`, `errorMessage`, `durationMs`

Logger context: `"HTTP"` using NestJS `Logger`.

---

## 3. HTTP Client

**Directory:** `src/common/http/`

### `HttpClientConfig` (abstract class)

Each consuming module creates a concrete subclass:

```ts
abstract class HttpClientConfig {
  abstract getBaseUrl(): string;
  abstract getServiceName(): string;
  abstract getAdditionalHeaders(): Record<string, string>;
}
```

### `HttpClientService`

- REQUEST-scoped injectable wrapping Axios.
- Constructor receives an `HttpClientConfig` instance + injects `REQUEST` token.
- Public methods: `get`, `post`, `put`, `patch`, `delete`.
- Automatically injects `X-Trace-Id` header from `req.traceId` on every call.
- Logs outgoing request: `traceId`, `serviceName`, `method`, `url`.
- Logs response: `traceId`, `serviceName`, `statusCode`, `durationMs`.
- Logs error: `traceId`, `serviceName`, `statusCode`, `errorMessage`, `durationMs`.

### `HttpClientModule`

- `@Global()` module exporting `HttpClientService`.

### Example usage (future module)

```ts
@Injectable()
export class SomeExternalHttpConfig extends HttpClientConfig {
  getBaseUrl() { return 'https://external-service.com'; }
  getServiceName() { return 'ExternalService'; }
  getAdditionalHeaders() { return { 'X-Api-Key': 'secret' }; }
}

// In module providers:
{ provide: HttpClientConfig, useClass: SomeExternalHttpConfig }
```

---

## 4. Enhanced `ResponseTransformInterceptor`

Becomes REQUEST-scoped. Updated response envelope:

```ts
{
  success: true,
  data: T,
  timestamp: string,
  traceId: string
}
```

---

## 5. Enhanced `HttpExceptionFilter`

Becomes REQUEST-scoped. Updated error envelope:

```ts
{
  statusCode: number,
  timestamp: string,
  path: string,
  message: unknown,
  traceId: string
}
```

---

## File Structure

```
backend/src/
  common/
    interceptors/
      logging.interceptor.ts        ← NEW
      response-transform.interceptor.ts  ← MODIFIED (add traceId, REQUEST-scoped)
    filters/
      http-exception.filter.ts      ← MODIFIED (add traceId, REQUEST-scoped)
    http/
      http-client.config.ts         ← NEW (abstract class)
      http-client.service.ts        ← NEW (REQUEST-scoped Axios wrapper)
      http-client.module.ts         ← NEW (@Global module)
      index.ts                      ← NEW (barrel export)
  main.ts                           ← MODIFIED (register LoggingInterceptor globally)
```

---

## Request Scoping Notes

- `LoggingInterceptor`, `ResponseTransformInterceptor`, `HttpExceptionFilter`, and `HttpClientService` all become REQUEST-scoped.
- Global registration in `main.ts` uses `app.useGlobalInterceptors` / `app.useGlobalFilters` — these don't support DI. To enable REQUEST-scope on global components, they must be registered via the `AppModule` providers array instead.

---

## Dependencies

No new npm packages required — Axios is already available via `@nestjs/axios` or can be added. NestJS `Logger` is built-in.
