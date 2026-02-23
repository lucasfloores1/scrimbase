import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { configs } from './config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.logger';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScrimsModule } from './scrims/scrims.module';
import { StratsModule } from './strats/strats.module';
import { DashboardModule } from './dashboard/dashboard.module';

const mongoLogger = new Logger('MongoDB');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    WinstonModule.forRoot(winstonConfig),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          mongoLogger.log('✅ Connected to MongoDB');
          connection.on('error', (error) => {
            mongoLogger.error('❌ MongoDB connection error', (error as Error)?.stack);
            process.exit(1);
          });
          return connection;
        },
        connectionErrorFactory: (error) => {
          mongoLogger.error('❌ MongoDB initial connection error', (error as Error)?.stack);
          process.exit(1);
        }
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot : '/uploads'
    }),
    AuthModule,
    UsersModule,
    TeamsModule,
    ScrimsModule,
    StratsModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(HttpLoggerMiddleware)
    .forRoutes({  path: '/*path', method: RequestMethod.ALL } );
  }
}

