import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Team } from './schemas/team.schema';
import { Model, Types } from 'mongoose';
import { TeamRole } from './schemas/team-member.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamMemberService } from './team-member.service';
import { generateInviteCode } from './utils/invite-code';

@Injectable()
export class TeamsService {
    constructor(
        @InjectModel(Team.name) private readonly teamModel: Model<Team>,
        private readonly teamMemberService: TeamMemberService,
    ) {}

    async createTeam(userId: string, dto: CreateTeamDto) {
        const existingMembership = await this.teamMemberService.getUserMembership(userId);
        if (existingMembership) {
            throw new BadRequestException('User is already a member of a team');
        }

        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const team = await this.teamModel.create({
                    name: dto.name,
                    tag: dto.tag,
                    createdBy: new Types.ObjectId(userId),
                    inviteCode: generateInviteCode(),
                });

                await this.teamMemberService.createOwner(userId, team._id.toString());

                return team.toObject();
            } catch (err: any) {
                if (err?.code === 11000 && err?.keyPattern?.inviteCode) {
                    continue;
                }
                throw err;
            }
        }

        throw new BadRequestException('Could not generate invite code. Please try again.');
    }

    async joinTeam(userId: string, teamId: string) {
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

    async getTeamById(teamId: string) {
        const team = await this.teamModel
            .findById(new Types.ObjectId(teamId))
            .lean()
            .exec();

        if (!team) return null;

        return team;
    }

    async getUserTeam(userId: string) {
        const membership = await this.teamMemberService.getUserMembership(userId);
        if (!membership) return null;
        return this.getTeamById(membership.teamId);
    }

    async joinByInviteCode(userId: string, inviteCode: string) {
        const existingMembership = await this.teamMemberService.getUserMembership(userId);
        if (existingMembership) {
            throw new BadRequestException('User already belongs to a team');
        }

        const team = await this.teamModel.findOne({ inviteCode }).exec();
        if (!team) {
            throw new BadRequestException('Invalid invite code');
        }
        return this.teamMemberService.createMember(userId, team._id.toString(), TeamRole.PLAYER);
    }
}
