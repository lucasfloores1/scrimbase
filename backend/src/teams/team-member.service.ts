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
        const doc = await this.teamMemberModel
            .findOne({ userId: new Types.ObjectId(userId) })
            .lean()
            .exec();

        if (!doc) return null;

        return this.toMembershipPlain(doc);
    }

    async createOwner(userId: string, teamId: string) {
        const member = await this.teamMemberModel.create({
            userId: new Types.ObjectId(userId),
            teamId: new Types.ObjectId(teamId),
            role: TeamRole.MANAGER,
            isAdmin: true,
            joinedAt: new Date(),
        });

        return this.toMembershipPlain(member.toObject());
    }

    async createMember(userId: string, teamId: string, role: TeamRole) {
        const membership = await this.teamMemberModel.create({
            userId: new Types.ObjectId(userId),
            teamId: new Types.ObjectId(teamId),
            role,
            isAdmin: false,
            joinedAt: new Date(),
        });

        return this.toMembershipPlain(membership.toObject());
    }

    async isAdmin(userId: string, teamId: string) {
        return this.teamMemberModel.exists({
            userId: new Types.ObjectId(userId),
            teamId: new Types.ObjectId(teamId),
            isAdmin: true,
        });
    }

    async getTeamMembers(teamId: string) {
        const docs = await this.teamMemberModel
            .find({ teamId: new Types.ObjectId(teamId) })
            .populate('userId', 'username riotId altAccountId')
            .lean()
            .exec();

        return docs.map((doc) => {
            const user = doc.userId as unknown as {
                _id: Types.ObjectId;
                username: string;
                riotId?: string;
                altAccountId?: string;
            } | null;

            return {
                id: String(doc._id),
                teamId: String(doc.teamId),
                role: doc.role,
                isAdmin: doc.isAdmin,
                joinedAt:
                    doc.joinedAt instanceof Date
                        ? doc.joinedAt.toISOString()
                        : doc.joinedAt
                          ? String(doc.joinedAt)
                          : undefined,
                user: user
                    ? {
                          id: String(user._id),
                          username: user.username,
                          riotId: user.riotId,
                          altAccountId: user.altAccountId,
                      }
                    : null,
            };
        });
    }

    async countAdmins(teamId: string) {
        return this.teamMemberModel
            .countDocuments({
                teamId: new Types.ObjectId(teamId),
                isAdmin: true,
            })
            .exec();
    }

    async removeMember(userId: string, teamId: string) {
        const admins = await this.countAdmins(teamId);
        const isAdmin = await this.isAdmin(userId, teamId);

        if (isAdmin && admins <= 1) {
            throw new BadRequestException('Team must have at least one admin');
        }

        const res = await this.teamMemberModel
            .deleteOne({
                userId: new Types.ObjectId(userId),
                teamId: new Types.ObjectId(teamId),
            })
            .exec();

        if (res.deletedCount === 0) {
            throw new BadRequestException('Member not found in team');
        }

        return null;
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
        });

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

        return null;
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
        });

        if (!target) {
            throw new BadRequestException('Target member not found');
        }

        target.role = role;
        await target.save();
        return null;
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

        if (!actor) throw new BadRequestException('Actor member not found');
        if (!target) throw new BadRequestException('Target member not found');

        target.isAdmin = true;
        await target.save();
        actor.isAdmin = false;
        await actor.save();

        return null;
    }

    async areUsersMembersOfTeam(teamId: string, userIds: string[]) {
        const unique = Array.from(new Set(userIds)).filter(Boolean);
        if (!unique.length) return true;
        if (!Types.ObjectId.isValid(teamId)) return false;
        if (unique.some((id) => !Types.ObjectId.isValid(id))) return false;

        const count = await this.teamMemberModel.countDocuments({
            teamId: new Types.ObjectId(teamId),
            userId: { $in: unique.map((id) => new Types.ObjectId(id)) },
        });

        return count === unique.length;
    }

    async countTeamMembers(teamId: string): Promise<number> {
        return this.teamMemberModel
            .countDocuments({
                teamId: new Types.ObjectId(teamId),
            })
            .exec();
    }

    /** Used by screenshot matcher — populated mongoose docs */
    async getTeamMembersForMatching(teamId: string) {
        return this.teamMemberModel
            .find({ teamId: new Types.ObjectId(teamId) })
            .populate('userId', 'username email riotId riotIdNormalized altAccountId altAccountIdNormalized')
            .exec();
    }

    private toMembershipPlain(doc: {
        _id: unknown;
        userId: unknown;
        teamId: unknown;
        role: TeamRole;
        isAdmin: boolean;
        joinedAt?: Date | string;
    }) {
        return {
            id: String(doc._id),
            userId: String(doc.userId),
            teamId: String(doc.teamId),
            role: doc.role,
            isAdmin: doc.isAdmin,
            joinedAt:
                doc.joinedAt instanceof Date
                    ? doc.joinedAt.toISOString()
                    : doc.joinedAt
                      ? String(doc.joinedAt)
                      : undefined,
        };
    }
}
