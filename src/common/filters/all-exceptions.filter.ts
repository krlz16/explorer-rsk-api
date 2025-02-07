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

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();

      message =
        typeof responseMessage === 'string'
          ? responseMessage
          : (responseMessage as any).message || JSON.stringify(responseMessage);
    }

    const stack = exception instanceof Error ? exception.stack : '';
    const serviceName = stack
      ? this.extractServiceName(stack)
      : 'UnknownService';

    this.logger.error(
      `[${serviceName}] Error ${status}: ${message} (URL: ${request.url})`,
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
