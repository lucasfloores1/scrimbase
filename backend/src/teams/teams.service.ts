import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Team } from './schemas/team.schema';
import { Model, Types } from 'mongoose';
import { TeamMember, TeamRole } from './schemas/team-member.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamMemberService } from './team-member.service';

@Injectable()
export class TeamsService {
    constructor(
        @InjectModel(Team.name) private readonly teamModel: Model<Team>,
        private readonly teamMemberService: TeamMemberService,
    ) {}

    async createTeam( userId: string, dto: CreateTeamDto ) {
        const existingMembership = await this.teamMemberService.getUserMembership(userId);
        if (existingMembership) {
            throw new BadRequestException('User is already a member of a team');
        }

        const team = await this.teamModel.create({
            name: dto.name,
            tag: dto.tag,
            createdBy: new Types.ObjectId(userId),
        });

        await this.teamMemberService.createOwner(userId, team._id.toString());

        return team;
    }

    async joinTeam( userId: string, teamId: string ) {
        const existingMembership = await this.teamMemberService.getUserMembership(userId);
        if (existingMembership) {
            throw new BadRequestException('User is already a member of a team');
        }
        const team = await this.getTeamById(teamId);
        if (!team) {
            throw new BadRequestException('Team not found');
        }
        return this.teamMemberService.createMember(userId, teamId, TeamRole.PLAYER);
    }

    async getTeamById( teamId: string ) {
        return this.teamModel.findById( new Types.ObjectId(teamId) ).exec();
    }

    async getUserTeam( userId: string ) {
        const membership = await this.teamMemberService.getUserMembership(userId);

        return membership ?? null;
    }

}