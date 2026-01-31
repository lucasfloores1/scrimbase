import { BadRequestException, Injectable } from '@nestjs/common';
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

    async createMember(userId: string, teamId: string, role: TeamRole) {
        return this.teamMemberModel.create({
            userId: new Types.ObjectId(userId),
            teamId: new Types.ObjectId(teamId),
            role: role,
            isAdmin: false,
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
            throw new BadRequestException('Team must have at least one admin');
        }

        const res = await this.teamMemberModel.deleteOne({
            userId: new Types.ObjectId(userId),
            teamId: new Types.ObjectId(teamId),
        }).exec();

        if (res.deletedCount === 0) {
            throw new BadRequestException('Member not found in team');
        }

        return { success: true };
    }

    async setAdminStatus(params: {
        actorUserId: string;
        targetUserId: string;
        teamId: string;
        isAdmin: boolean;
    }) {
        const { targetUserId, teamId, isAdmin } = params;

        const target = await this.teamMemberModel.findOne({
            userId: new Types.ObjectId(targetUserId),
            teamId: new Types.ObjectId(teamId),
        })

        if (!target) {
            throw new BadRequestException('Target member not found in team');
        }

        if (target.isAdmin && !isAdmin) {
            const admins = await this.countAdmins(teamId);
            if (admins <= 1) {
                throw new BadRequestException('Team must have at least one admin');
            }
        }

        target.isAdmin = isAdmin;
        await target.save();

        return { success: true  };
    }

    async setRole(params: {
        targetUserId: string;
        teamId: string;
        role: TeamRole;
    }) {
        const { targetUserId, teamId, role } = params;
        const target = await this.teamMemberModel.findOne({
            userId: new Types.ObjectId(targetUserId),
            teamId: new Types.ObjectId(teamId),
        })

        if (!target) {
            throw new BadRequestException('Target member not found');
        }

        target.role = role;
        await target.save();
        return { success: true };
    }

    async transferAdmin(params: {
        actorUserId: string;
        targetUserId: string;
        teamId: string;
    }) {
        const { actorUserId, targetUserId, teamId } = params;

        if (actorUserId === targetUserId) {
            throw new BadRequestException('Cannot transfer admin to self');
        }

        const actor = await this.teamMemberModel.findOne({
            userId: new Types.ObjectId(actorUserId),
            teamId: new Types.ObjectId(teamId),
        });

        const target = await this.teamMemberModel.findOne({
            userId: new Types.ObjectId(targetUserId),
            teamId: new Types.ObjectId(teamId),
        });

        if(!actor) throw new BadRequestException('Actor member not found');
        if(!target) throw new BadRequestException('Target member not found');

        target.isAdmin = true;
        await target.save();
        actor.isAdmin = false;
        await actor.save();

        return { success: true };
    }

    
}
