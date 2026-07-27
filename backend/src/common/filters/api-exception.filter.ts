import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const error = this.normalizeError(exception, status);

    response.status(status).json({
      success: false,
      data: null,
      error,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  private normalizeError(exception: unknown, status: number) {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: status,
        message: "Internal server error",
      };
    }

    const raw = exception.getResponse();

    if (typeof raw === "string") {
      return {
        statusCode: status,
        message: raw,
      };
    }

    const body = raw as Record<string, unknown>;
    const { message, details } = this.normalizeMessage(body.message ?? exception.message);

    return {
      statusCode: status,
      message,
      ...(details ? { details } : {}),
      ...(body.error ? { error: body.error } : {}),
      ...(body.rawOutputId ? { rawOutputId: body.rawOutputId } : {}),
    };
  }

  /** Keep `message` a string; put validation arrays in `details`. */
  private normalizeMessage(message: unknown): { message: string; details?: string[] } {
    if (Array.isArray(message)) {
      const details = message.map(String);
      return {
        message: details[0] ?? "Bad Request",
        details,
      };
    }

    if (typeof message === "string") {
      return { message };
    }

    return { message: "Bad Request" };
  }
}
