import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class TeamMemberGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const membership = req.user?.teamMember;

        const paramTeamId = req.params?.teamId;

        if (!membership) {
            throw new ForbiddenException('User is not a member of any team');
        }

        const rawTeamId = membership.teamId;
        const memberTeamId =
        typeof rawTeamId === "string"
            ? rawTeamId
            : (rawTeamId?._id?.toString?.() ?? rawTeamId?.toString?.() ?? String(rawTeamId?._id ?? rawTeamId));

        if (paramTeamId) {
            if (!paramTeamId || memberTeamId !== paramTeamId) {
                throw new ForbiddenException('User is not a member of this team');
            }
        }

        return true;
    }
}