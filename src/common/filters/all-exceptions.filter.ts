import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
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

    const stack = exception instanceof Error ? exception.stack : '';
    const serviceName = stack
      ? this.extractServiceName(stack)
      : 'UnknownService';

    this.logger.error(
      `[${serviceName}] ${status >= 500 ? 'Server Error' : 'Client Error'} ${status}: ${JSON.stringify(message)} (URL: ${request.url})`,
      stack,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  /**
   * Extracts the service name from the error stack trace.
   */
  private extractServiceName(stack: string): string {
    const match = stack.match(/at (\w+Service)/);
    return match ? match[1] : 'UnknownService';
  }
}
