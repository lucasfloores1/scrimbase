import { IsNotEmpty, IsString } from "class-validator";

export class JoinTeamByCodeDto {
    @IsString()
    @IsNotEmpty()
    inviteCode: string;
}