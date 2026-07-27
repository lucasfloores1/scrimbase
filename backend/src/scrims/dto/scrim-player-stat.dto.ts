import { Expose } from "class-transformer";
import { IsInt, IsMongoId, IsNotEmpty, IsString, Min, ValidateIf } from "class-validator";

export class ScrimPlayerStatDto {
    
    @Expose()
    @ValidateIf((o) => !o.displayName)
    @IsMongoId()
    userId: string;

    @Expose()
    @ValidateIf((o) => !o.userId)
    @IsString()
    @IsNotEmpty()
    displayName: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    agent: string;

    @Expose()
    @IsInt()
    @Min(0)
    kills: number;

    @Expose()
    @IsInt()
    @Min(0)
    deaths: number;

    @Expose()
    @IsInt()
    @Min(0)
    assists: number;

    @Expose()
    @IsInt()
    @Min(0)
    acs: number;

}