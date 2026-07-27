import { IsEnum } from "class-validator";
import { TeamRole } from "../schemas/team-member.schema";

export class UpdateMemberRoleDto {

    @IsEnum(TeamRole)
    role: TeamRole;
}