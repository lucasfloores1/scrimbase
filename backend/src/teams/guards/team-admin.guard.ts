import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class TeamAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const isAdmin = req.user?.teamMember?.isAdmin;

        if (!isAdmin) {
            throw new ForbiddenException('User is not a team admin');
        }

        return true;
    }
}