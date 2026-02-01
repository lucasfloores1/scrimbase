import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateStratDto {

    @IsString()
    @IsNotEmpty()
    map : string;

    @IsString()
    @IsOptional()
    @MaxLength(5000)
    notes? : string;

}