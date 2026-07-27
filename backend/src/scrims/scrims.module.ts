import { Module } from "@nestjs/common";
import { ScrimsService } from "./scrims.service";
import { ScrimsController } from "./scrims.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Scrim, ScrimSchema } from "./schemas/scrim.schema";
import { TeamsModule } from "src/teams/teams.module";

import { LlmModule } from "src/common/llm/llm.module";
import { ScrimParseAttempt, ScrimParseAttemptSchema } from "./parsing/schemas/scrim-parse-attempt.schema";
import { ScrimScreenshotParserService } from "./parsing/scrim-screenshot-parser.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Scrim.name, schema: ScrimSchema },
      { name: ScrimParseAttempt.name, schema: ScrimParseAttemptSchema },
    ]),
    TeamsModule,
    LlmModule,
  ],
  providers: [ScrimsService, ScrimScreenshotParserService],
  controllers: [ScrimsController],
})
export class ScrimsModule {}