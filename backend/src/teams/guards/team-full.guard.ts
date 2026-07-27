import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { TeamMemberService } from "../team-member.service";

@Injectable()
export class TeamFullGuard implements CanActivate {
    constructor (private readonly teamMemberService : TeamMemberService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const membership = req.user?.teamMember;

        const paramTeamId = req.params?.teamId;
        const rawTeamId = membership.teamId;
        const memberTeamId =
        typeof rawTeamId === "string"
            ? rawTeamId
            : (rawTeamId?._id?.toString?.() ?? rawTeamId?.toString?.() ?? String(rawTeamId?._id ?? rawTeamId));

        const teamId = paramTeamId ?? memberTeamId;
        const count = await this.teamMemberService.countTeamMembers(teamId);

        if (count < 5) {
            throw new ForbiddenException("Team must have 5 members to submit scrims");
        }

        return true;
    }
}