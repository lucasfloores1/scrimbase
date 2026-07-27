import { IsEnum, IsOptional, IsString } from "class-validator";
import { MatchSide } from "src/common/enums/team-role.enum";

export class UpdateStratDto {

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    map?: string;

    @IsEnum(MatchSide)
    @IsOptional()
    side?: MatchSide;

    @IsString()
    @IsOptional()
    notes?: string;

}