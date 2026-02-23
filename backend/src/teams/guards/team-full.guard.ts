import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { TeamMemberService } from "../team-member.service";

@Injectable()
export class TeamFullGuard implements CanActivate {
    constructor (private readonly teamMemberService : TeamMemberService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const membership = req.user?.teamMember;

        const paramTeamId = req.params?.teamId;
        const memberTeamId = membership.teamId?._id.toString?.() ?? membership.teamId._id;

        const teamId = paramTeamId ?? memberTeamId;
        const count = await this.teamMemberService.countTeamMembers(teamId);

        if (count < 5) {
            throw new ForbiddenException("Team must have 5 members to submit scrims");
        }

        return true;
    }
}