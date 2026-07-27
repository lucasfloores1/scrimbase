import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ScrimType } from "../../enums/scrim-type.enum";

export class ParseScrimScreenshotRequestDto {
  @IsEnum(ScrimType)
  type: ScrimType;

  @IsString()
  @IsNotEmpty()
  map: string;
}