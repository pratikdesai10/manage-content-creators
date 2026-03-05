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
