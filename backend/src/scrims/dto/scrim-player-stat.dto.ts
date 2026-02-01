import { IsInt, IsMongoId, IsNotEmpty, IsString, Min, ValidateIf } from "class-validator";

export class ScrimPlayerStatDto {
    
    @ValidateIf((o) => !o.displayName)
    @IsMongoId()
    userId: string;

    @ValidateIf((o) => !o.userId)
    @IsString()
    @IsNotEmpty()
    displayName: string;

    @IsString()
    @IsNotEmpty()
    agent: string;

    @IsInt()
    @Min(0)
    kills: number;

    @IsInt()
    @Min(0)
    deaths: number;

    @IsInt()
    @Min(0)
    assists: number;

    @IsInt()
    @Min(0)
    acs: number;

}