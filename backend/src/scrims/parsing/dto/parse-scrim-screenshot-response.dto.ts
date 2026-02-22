import { CreateScrimDto } from "../../dto/create-scrim.dto";
import { ScrimOutcome } from "../../enums/scrim-outcome.enum";

export class ParseScrimScreenshotResponseDto {
  rawOutputId: string;
  warnings?: string[];
  draft: CreateScrimDto & { outcome: ScrimOutcome };
}