import { Module } from '@nestjs/common';
import { StratsService } from './strats.service';
import { StratsController } from './strats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Strat, StratSchema } from './schemas/strat.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Strat.name , schema : StratSchema}
    ])
  ],
  providers: [StratsService],
  controllers: [StratsController]
})
export class StratsModule {}
