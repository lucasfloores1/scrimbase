import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { MatchesModule } from './matches/matches.module';
import { configs } from './config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.logger';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';

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
    AuthModule,
    UsersModule,
    TeamsModule,
    MatchesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(HttpLoggerMiddleware)
    .forRoutes({  path: '*', method: RequestMethod.ALL } );
  }
}

