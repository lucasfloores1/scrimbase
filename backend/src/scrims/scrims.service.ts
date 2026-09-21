import { BadRequestException, Inject, Injectable, type LoggerService } from '@nestjs/common';
import { ScrimType } from './enums/scrim-type.enum';
import { ScrimOutcome } from './enums/scrim-outcome.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Scrim } from './schemas/scrim.schema';
import { Model, Types } from 'mongoose';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TeamMemberService } from 'src/teams/team-member.service';
import { ListScrimsQueryDto } from './dto/list-scrims-query.dto';
import { ValorantMap } from 'src/common/enums/valorant-map.enum';
import { ValorantAgent } from 'src/common/enums/valorant-agent.enum';
import { MAX_SCRIM_SUBS, MAX_SCRIM_TEAM_STATS, MIN_SCRIM_TEAM_STATS, ScrimPlayerKind } from './enums/scrim-player-kind.enum';

type CreateScrimPayload = {
    type: ScrimType;
    map: ValorantMap;
    opponentName: string;
    teamRounds: number;
    enemyRounds: number;
    outcome: ScrimOutcome;
    teamStats: {
        userId?: string;
        displayName?: string;
        kind?: ScrimPlayerKind;
        agent: ValorantAgent;
        kills: number;
        deaths: number;
        assists: number;
        acs: number;
    }[];
    enemyComposition: ValorantAgent[];
};

@Injectable()
export class ScrimsService {
    constructor(
        @InjectModel(Scrim.name) private readonly scrimModel: Model<Scrim>,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly teamMemberService: TeamMemberService,
    ) {}

    async create(teamId: string, userId: string, payload: CreateScrimPayload, screenshotUrl: string) {
        this.logger.log(
            `Creating scrim teamId=${teamId} createdBy=${userId} type=${payload.type} map=${payload.map} opponent=${payload.opponentName} rounds=${payload.teamRounds}-${payload.enemyRounds}`,
            'ScrimsService',
        );

        if (payload.teamStats.length < MIN_SCRIM_TEAM_STATS || payload.teamStats.length > MAX_SCRIM_TEAM_STATS) {
            throw new BadRequestException(
                `teamStats must contain ${MIN_SCRIM_TEAM_STATS} to ${MAX_SCRIM_TEAM_STATS} players`,
            );
        }

        const normalizedStats = payload.teamStats.map((p) => {
            const kind = p.kind ?? (p.userId ? ScrimPlayerKind.MEMBER : ScrimPlayerKind.SUB);

            if (kind === ScrimPlayerKind.MEMBER && !p.userId) {
                throw new BadRequestException('MEMBER teamStats require a userId');
            }

            if (kind === ScrimPlayerKind.SUB && p.userId) {
                throw new BadRequestException('SUB teamStats cannot include a userId');
            }

            if (kind === ScrimPlayerKind.SUB && !p.displayName?.trim()) {
                throw new BadRequestException('SUB teamStats require a displayName');
            }

            return { ...p, kind };
        });

        const subCount = normalizedStats.filter((p) => p.kind === ScrimPlayerKind.SUB).length;
        if (subCount > MAX_SCRIM_SUBS) {
            throw new BadRequestException(`A scrim can include at most ${MAX_SCRIM_SUBS} SUB players`);
        }

        const memberIds = normalizedStats
            .map((p) => p.userId)
            .filter((id): id is string => typeof id === 'string' && id.length > 0);

        if (new Set(memberIds).size !== memberIds.length) {
            throw new BadRequestException('Duplicate teamStats userId');
        }

        const ok = await this.teamMemberService.areUsersMembersOfTeam(teamId, memberIds);

        if (!ok) throw new BadRequestException('Some teamStats userId do not belong to the team');

        return this.scrimModel.create({
            teamId: new Types.ObjectId(teamId),
            createdBy: new Types.ObjectId(userId),
            ...payload,
            opponentName: payload.opponentName.trim(),
            screenshotUrl,
            teamStats: normalizedStats.map((p) => ({
                ...p,
                userId: p.kind === ScrimPlayerKind.MEMBER && p.userId ? new Types.ObjectId(p.userId) : undefined,
            })),
        });
    }

    /**
     * Builds a Mongo filter from validated query DTO.
     * Always scopes by teamId so one team never sees another's scrims.
     */
    async findByTeam(teamId: string, query: ListScrimsQueryDto = {}) {
        const filter: Record<string, unknown> = {
            teamId: new Types.ObjectId(teamId),
        };

        if (query.map) {
            filter.map = query.map;
        }

        if (query.type) {
            filter.type = query.type;
        }

        if (query.outcome) {
            filter.outcome = query.outcome;
        }

        if (query.opponentName?.trim()) {
            // Escape regex special chars so user input is treated literally.
            const escaped = query.opponentName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.opponentName = { $regex: escaped, $options: 'i' };
        }

        if (query.agents?.length) {
            if (query.exactComposition) {
                // Full enemy lineup: same agents, same size (order-independent).
                filter.enemyComposition = {
                    $all: query.agents,
                    $size: query.agents.length,
                };
            } else {
                // Partial: enemy had at least these agents (e.g. "games vs Jett+Sova").
                filter.enemyComposition = { $all: query.agents };
            }
        }

        if (query.playerId) {
            filter['teamStats.userId'] = new Types.ObjectId(query.playerId);
        }

        if (query.from || query.to) {
            const createdAt: Record<string, Date> = {};
            if (query.from) createdAt.$gte = new Date(query.from);
            if (query.to) createdAt.$lte = new Date(query.to);
            filter.createdAt = createdAt;
        }

        let q = this.scrimModel.find(filter).sort({ createdAt: -1 }).lean();

        if (query.limit) {
            q = q.limit(query.limit);
        }

        return q.exec();
    }

    async findOne(teamId: string, scrimId: string) {
        return this.scrimModel
            .findOne({
                _id: new Types.ObjectId(scrimId),
                teamId: new Types.ObjectId(teamId),
            })
            .lean()
            .exec();
    }
}
