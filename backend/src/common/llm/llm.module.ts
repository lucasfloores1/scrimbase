import { Module } from "@nestjs/common";
import { LlmVisionService } from "./llm-vision.service";

@Module({
  providers: [LlmVisionService],
  exports: [LlmVisionService],
})
export class LlmModule {}