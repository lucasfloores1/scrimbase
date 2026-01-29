import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { log } from './utils/logger.util';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { MatchesModule } from './matches/matches.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          log('info', '✅ Connected to MongoDB', 'MongoDB');
          connection.on('error', (error) => {
            log('error', `❌ MongoDB connection error: ${error}`, 'MongoDB');
            process.exit(1);
          });
        },
        connectionErrorFactory: (error) => {
          log('error', `❌ MongoDB initial connection error: ${error}`, 'MongoDB');
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
export class AppModule {}

