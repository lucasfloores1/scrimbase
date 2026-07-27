import { Inject, Injectable, type LoggerService, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger : LoggerService,
    ) {}

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl } = req;
        const startTime = Date.now();

        res.on('finish', () => {
            const ms = Date.now() - startTime;
            const statusCode = res.statusCode;
            this.logger.log(`${method} ${originalUrl} ${statusCode} - ${ms}ms`, 'HTTP');
        });
        next();
    }
}