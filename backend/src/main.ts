import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { log } from './utils/logger.util';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { WinstonAdapter } from './utils/nest-winston.adapter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {

  try {

  const app = await NestFactory.create(AppModule/*, { logger: new WinstonAdapter() }*/);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

  const config = new DocumentBuilder()
    .setTitle('Scrimbase API')
    .setDescription('API for managing scrims, teams and player stats')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = app.get(ConfigService).get<number>('app.port') || 3000;
  await app.listen(port);
  log('info', `🚀 Application is running on: http://localhost:${port}`, 'Bootstrap');
    
  } catch (error) {

    log('error', `❌ Application bootstrap error: ${error}`, 'Bootstrap');
    process.exit(1);
    
  }
}

bootstrap();
