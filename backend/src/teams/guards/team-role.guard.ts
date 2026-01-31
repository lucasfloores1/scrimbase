import { CanActivate, ExecutionContext, ForbiddenException, Injectable, mixin } from "@nestjs/common";
import { TeamRole } from "../schemas/team-member.schema";

Injectable()
export const TeamRoleGuard = ( allowedRoles: TeamRole[] ) => {
    class RoleGuard implements CanActivate {
        canActivate(context: ExecutionContext): boolean {
            const req = context.switchToHttp().getRequest();
            const role = req.user?.teamMember?.role;

            if (!role || !allowedRoles.includes(role)) {
                throw new ForbiddenException('User does not have the required team role');
            }
            
            return true;
        }
    }
    return mixin(RoleGuard);
}    
    