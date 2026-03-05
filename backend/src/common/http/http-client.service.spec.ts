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
