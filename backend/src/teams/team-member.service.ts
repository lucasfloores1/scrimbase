import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { TeamMember, TeamMemberDocument, TeamRole } from './schemas/team-member.schema';

@Injectable()
export class TeamMemberService {
    constructor(
        @InjectModel(TeamMember.name)
        private readonly teamMemberModel: Model<TeamMemberDocument>,
    ) {}

    async getUserMembership(userId: string) {
        return this.teamMemberModel.findOne({ userId: new Types.ObjectId(userId) }).populate('teamId').exec();
    }

    async createOwner(userId: string, teamId: string) {
        return this.teamMemberModel.create({
            userId: new Types.ObjectId(userId),
            teamId: new Types.ObjectId(teamId),
            role: TeamRole.MANAGER,
            isAdmin: true,
            joinedAt: new Date(),
        });
    }

    async isAdmin(  userId: string, teamId: string  ) {
        return this.teamMemberModel.exists({
            userId: new Types.ObjectId(userId),
            teamId: new Types.ObjectId(teamId),
            isAdmin: true,
        });
    }

    async getTeamMembers( teamId: string ) {
        return this.teamMemberModel.find({ teamId: new Types.ObjectId(teamId) }).populate('userId', 'username email').exec();
    }

    async countAdmins( teamId: string ) {
        return this.teamMemberModel.countDocuments({
            teamId: new Types.ObjectId(teamId),
            isAdmin: true,
        }).exec();
    }

    async removeMember( userId: string, teamId: string ) {
        const admins = await this.countAdmins(teamId);

        const isAdmin = await this.isAdmin(userId, teamId);

        if (isAdmin && admins <= 1) {
            throw new Error('Team must have at least one admin');
        }

        return this.teamMemberModel.deleteOne({
            userId: new Types.ObjectId(userId),
            teamId: new Types.ObjectId(teamId),
        }).exec();
    }
}
