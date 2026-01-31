import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { TeamMember } from "../schemas/team-member.schema";
import { Model, Types } from "mongoose";

@Injectable()
export class TeamMemberGuard implements CanActivate {
    constructor(
        @InjectModel(TeamMember.name)
        private teamMemberModel: Model<TeamMember>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const teamMember = request.user?.teamMember;

        if (!teamMember) {
            throw new Error('User is not a member of any team');
        }
        
        return true;
    }
}