import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ConfigService } from '@nestjs/config';
import { ApiResponseInterceptor } from "./common/interceptors/api-response.interceptor";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";
import { Logger } from '@nestjs/common';
import { bootstrapLogger } from './logger/winston.logger';

async function bootstrap() {
  const bootstrapNestLogger = new Logger('Bootstrap');

  try {

    const app = await NestFactory.create(AppModule, {logger: bootstrapLogger} );

    app.setGlobalPrefix('api');

    app.useGlobalInterceptors(new ApiResponseInterceptor());
    app.useGlobalFilters(new ApiExceptionFilter());
    app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
        }),
    );

    const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

    app.enableCors({
      origin: (origin, callback) => {
        // Allows Postman // CURL
        if (!origin) return callback(null, true);

        if (allowedOrigins.length === 0) return callback(null, true); // fallback dev
        if (allowedOrigins.includes(origin)) return callback(null, true);

        return callback(new Error(`CORS blocked for origin: ${origin}`), false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Content-Disposition"],
    });

    const config = new DocumentBuilder()
      .setTitle('Scrimbase API')
      .setDescription('API for managing scrims, teams and player stats')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    const port = app.get(ConfigService).get<number>('app.port') || 3000;
    await app.listen(port);
    bootstrapNestLogger.log(`🚀 Application is running on: http://localhost:${port}`);
      
  } catch (error) {

    bootstrapNestLogger.error('❌ Application bootstrap error', (error as Error)?.stack);
    process.exit(1);
    
  }
}

bootstrap();
