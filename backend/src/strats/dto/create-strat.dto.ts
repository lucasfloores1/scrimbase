import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { MatchSide } from "src/common/enums/team-role.enum";

export class CreateStratDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    map: string;

    @IsEnum(MatchSide)
    side: MatchSide;

    @IsString()
    @IsOptional()
    @MaxLength(5000)
    notes?: string;

}