# Module: Common

## Purpose
- Shared infrastructure: error handling, response formatting, request logging, HTTP client

## Responsibilities
- Standardize error responses (`HttpExceptionFilter`)
- Wrap all responses in `{success, data, timestamp, traceId}` format
- Log all HTTP requests with trace IDs and duration
- Provide reusable HTTP client for inter-service communication
- Extend Express Request type with `traceId`

## Architecture
- Not a NestJS module — components registered as global providers in `AppModule`
- Interceptors and filters applied via `APP_INTERCEPTOR` / `APP_FILTER` tokens
- HTTP client module is `@Global()` for cross-module use

## Folder Structure
```
common/
├── filters/
│   ├── http-exception.filter.ts      — Global error handler
│   └── http-exception.filter.spec.ts — Unit tests
├── interceptors/
│   ├── logging.interceptor.ts            — Request/response logging + traceId
│   ├── logging.interceptor.spec.ts       — Unit tests
│   ├── response-transform.interceptor.ts — Response wrapper
│   └── response-transform.interceptor.spec.ts — Unit tests
├── http/
│   ├── http-client.config.ts   — Abstract config class
│   ├── http-client.service.ts  — HTTP client with tracing
│   ├── http-client.module.ts   — Global HTTP client module
│   ├── http-client.service.spec.ts — Unit tests
│   └── index.ts                — Barrel exports
├── types/
│   └── express.d.ts — Augments Request with traceId
├── decorators/       — (empty, reserved)
└── guards/           — (empty, reserved)
```

## Key Components
- **HttpExceptionFilter** — catches all exceptions, returns `{statusCode, timestamp, path, message, traceId}`
- **ResponseTransformInterceptor** — wraps responses in `ApiResponse<T>` format
- **LoggingInterceptor** — generates/reads `X-Trace-Id` header, logs request/response with duration
- **HttpClientService** — Axios-based HTTP client with trace propagation (30s timeout)

## Data Flow
- Request → LoggingInterceptor (assign traceId) → route handler → ResponseTransformInterceptor (wrap response)
- On error → HttpExceptionFilter (format error with traceId)

## Dependencies
- External: `axios`, `uuid`

## Integration
- Registered globally in `AppModule` via provider tokens
- `traceId` flows through request → interceptors → filters → response
- HTTP client propagates `X-Trace-Id` to downstream services

## Conventions
- All responses follow `ApiResponse<T>` shape: `{success, data, timestamp, traceId}`
- All errors follow: `{statusCode, timestamp, path, message, traceId}`
- Never bypass the global filter/interceptor chain

## Testing
- Run: `npm run test` from `backend/`
- Test files co-located with source (`.spec.ts`)
