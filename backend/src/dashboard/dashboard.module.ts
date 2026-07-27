import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Scrim, ScrimSchema } from "src/scrims/schemas/scrim.schema";
import { Team, TeamSchema } from "src/teams/schemas/team.schema";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Scrim.name, schema: ScrimSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
