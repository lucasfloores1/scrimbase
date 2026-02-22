import { IsEmail, IsString, Min, MinLength } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    username: string;

    @IsString()
    riotId: string;
}