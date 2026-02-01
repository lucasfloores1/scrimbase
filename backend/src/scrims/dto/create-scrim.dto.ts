import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsString, Max, Min, ValidateNested } from "class-validator";
import { ScrimType } from "../enums/scrim-type.enum";
import { Type } from "class-transformer";
import { ScrimPlayerStatDto } from "./scrim-player-stat.dto";

export class CreateScrimDto {

    @IsEnum(ScrimType)
    type: ScrimType;

    @IsString()
    @IsNotEmpty()
    map: string;

    @IsInt()
    @Min(0)
    @Max(24)
    teamRounds: number;

    @IsInt()
    @Min(0)
    @Max(24)
    enemyRounds: number;

    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @ValidateNested({ each: true })
    @Type(() => ScrimPlayerStatDto)
    teamStats: ScrimPlayerStatDto[];

    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @IsString({ each: true })
    enemyComposition: string[];
}