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
      const statusCode = (err as { response?: { status?: number } })?.response?.status ?? 0;
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error({ traceId, serviceName, statusCode, errorMessage, durationMs });
      throw err;
    }
  }
}
