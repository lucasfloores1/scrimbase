import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class TeamMemberGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const membership = req.user?.teamMember;

        const paramTeamId = req.params?.teamId;
        const memberTeamId = membership.teamId?._id.toString?.() ?? membership.teamId._id;

        if (!membership) {
            throw new ForbiddenException('User is not a member of any team');
        }

        if (paramTeamId) {
            if (!paramTeamId || memberTeamId !== paramTeamId) {
                throw new ForbiddenException('User is not a member of this team');
            }
        }

        return true;
    }
}