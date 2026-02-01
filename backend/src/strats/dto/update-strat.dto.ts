import { IsOptional, IsString } from "class-validator";

export class UpdateStratDto {
    @IsString()
    @IsOptional()
    map? : string;

    @IsString()
    @IsOptional()
    notes? : string;
}