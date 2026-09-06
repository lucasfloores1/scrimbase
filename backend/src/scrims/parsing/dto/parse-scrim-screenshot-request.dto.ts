import { IsEnum } from "class-validator";
import { ScrimType } from "../../enums/scrim-type.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";

export class ParseScrimScreenshotRequestDto {
  @IsEnum(ScrimType)
  type: ScrimType;

  @IsEnum(ValorantMap)
  map: ValorantMap;
}
