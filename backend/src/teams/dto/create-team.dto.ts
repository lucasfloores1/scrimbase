import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateTeamDto {

    @IsString()
    @IsNotEmpty()
    @Length(3, 30)
    name: string;

    @IsString()
    @IsNotEmpty()
    @Length(3, 5)
    tag: string;
}