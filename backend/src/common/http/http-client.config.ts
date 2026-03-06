export abstract class HttpClientConfig {
  abstract getBaseUrl(): string;
  abstract getServiceName(): string;
  abstract getAdditionalHeaders(): Record<string, string>;
}
