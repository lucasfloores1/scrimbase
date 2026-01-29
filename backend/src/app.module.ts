import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { MatchesModule } from './matches/matches.module';

@Module({
  imports: [AuthModule, UsersModule, TeamsModule, MatchesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
