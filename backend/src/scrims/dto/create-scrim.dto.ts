import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsString, Max, Min, ValidateNested } from "class-validator";
import { ScrimType } from "../enums/scrim-type.enum";
import { Expose, Type } from "class-transformer";
import { ScrimPlayerStatDto } from "./scrim-player-stat.dto";

export class CreateScrimDto {

    @Expose()
    @IsEnum(ScrimType)
    type: ScrimType;

    @Expose()
    @IsString()
    @IsNotEmpty()
    map: string;

    @Expose()
    @IsInt()
    @Min(0)
    @Max(24)
    teamRounds: number;

    @Expose()
    @IsInt()
    @Min(0)
    @Max(24)
    enemyRounds: number;

    @Expose()
    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @ValidateNested({ each: true })
    @Type(() => ScrimPlayerStatDto)
    teamStats: ScrimPlayerStatDto[];

    @Expose()
    @IsArray()
    @ArrayMinSize(5)
    @ArrayMaxSize(5)
    @IsString({ each: true })
    enemyComposition: string[];
}