import { IsBoolean } from "class-validator";

export class UpdateMemberAdminDto {

    @IsBoolean()
    isAdmin: boolean;
}