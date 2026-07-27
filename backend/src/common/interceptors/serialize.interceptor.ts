import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

export class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly dto: new (...args: any[]) => unknown) {}

  intercept(_context: ExecutionContext, handler: CallHandler): Observable<unknown> {
    return handler.handle().pipe(
      map((data: unknown) => {
        if (data === null || data === undefined) {
          return data;
        }

        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        });
      }),
    );
  }
}
