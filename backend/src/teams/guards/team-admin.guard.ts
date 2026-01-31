import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class TeamAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const isAdmin = req.user?.teamMember?.isAdmin;

        if (!isAdmin) {
            throw new Error('User is not a team admin');
        }

        return true;
    }
}