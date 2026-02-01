import { Module } from '@nestjs/common';
import { ScrimsService } from './scrims.service';
import { ScrimsController } from './scrims.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Scrim, ScrimSchema } from './schemas/scrim.schema';
import { TeamsModule } from 'src/teams/teams.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name : Scrim.name, schema : ScrimSchema}]),
    TeamsModule
  ],
  providers: [ScrimsService],
  controllers: [ScrimsController],
})
export class ScrimsModule {}
