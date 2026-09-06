import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Scrim, ScrimSchema } from "src/scrims/schemas/scrim.schema";
import { TeamsModule } from "src/teams/teams.module";
import { PlayersController } from "./players.controller";
import { PlayersService } from "./players.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Scrim.name, schema: ScrimSchema }]),
    TeamsModule,
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
})
export class PlayersModule {}
