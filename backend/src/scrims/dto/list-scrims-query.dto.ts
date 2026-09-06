import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { ScrimOutcome } from "../enums/scrim-outcome.enum";
import { ScrimType } from "../enums/scrim-type.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";
import { ValorantAgent } from "src/common/enums/valorant-agent.enum";

/**
 * Query params for GET /teams/:teamId/scrims
 */
export class ListScrimsQueryDto {
  @IsOptional()
  @IsEnum(ValorantMap)
  map?: ValorantMap;

  @IsOptional()
  @IsEnum(ScrimType)
  type?: ScrimType;

  @IsOptional()
  @IsEnum(ScrimOutcome)
  outcome?: ScrimOutcome;

  @IsOptional()
  @IsString()
  opponentName?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === "") return undefined;
    if (Array.isArray(value)) {
      return value.flatMap((v) => String(v).split(",")).map((s) => s.trim()).filter(Boolean);
    }
    return String(value)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  })
  @IsArray()
  @IsEnum(ValorantAgent, { each: true })
  agents?: ValorantAgent[];

  @IsOptional()
  @Transform(({ value }) => value === true || value === "true" || value === "1")
  @IsBoolean()
  exactComposition?: boolean;

  @IsOptional()
  @IsMongoId()
  playerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
