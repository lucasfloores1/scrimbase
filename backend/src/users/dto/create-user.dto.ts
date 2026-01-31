import { IsEmail, IsString, Min, MinLength } from "class-validator";

export class CreateUsaerDto {

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    username: string;
}