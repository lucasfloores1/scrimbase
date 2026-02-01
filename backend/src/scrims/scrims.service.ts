import { BadRequestException, Inject, Injectable, type LoggerService } from '@nestjs/common';
import { ScrimType } from './enums/scrim-type.enum';
import { ScrimOutcome } from './enums/scrim-outcome.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Scrim } from './schemas/scrim.schema';
import { Model, Types } from 'mongoose';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TeamMemberService } from 'src/teams/team-member.service';

type CreateScrimPayload = {
    type : ScrimType;
    map : string;
    teamRounds : number;
    enemyRounds : number;
    outcome : ScrimOutcome;
    teamStats : {
        userId? : string;
        displayName? : string;
        agent : string;
        kills : number;
        deaths : number;
        assists : number;
        acs : number;
    }[]
    enemyComposition : string[];
}

@Injectable()
export class ScrimsService {
    constructor(
        @InjectModel(Scrim.name) private readonly scrimModel: Model<Scrim>,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger : LoggerService,
        private readonly teamMemberService : TeamMemberService,
    ){}

    /*private validateRules(payload: CreateScrimPayload) {
        const totalRounds = payload.teamRounds + payload.enemyRounds;
        if (totalRounds > 24) throw new BadRequestException('Total rounds cannot exceed 24.');

        const isDraw = payload.teamRounds === payload.enemyRounds;
        if (payload.type !== ScrimType.SCRIM && isDraw) {
        throw new BadRequestException('Draw is only allowed for SCRIM type.');
        }

        if (payload.type !== ScrimType.SCRIM) {
        const maxRounds = Math.max(payload.teamRounds, payload.enemyRounds);
        const diff = Math.abs(payload.teamRounds - payload.enemyRounds);

        if (maxRounds < 13) throw new BadRequestException('Premier/Tournament requires reaching 13 rounds.');
        if (diff < 2) throw new BadRequestException('Premier/Tournament requires a 2-round difference.');
        }

        const computed =
        isDraw ? ScrimOutcome.DRAW : payload.teamRounds > payload.enemyRounds ? ScrimOutcome.WIN : ScrimOutcome.LOSS;

        if (computed !== payload.outcome) {
        throw new BadRequestException('Outcome mismatch with rounds.');
        }
    }*/

    async create( teamId: string, userId: string, payload : CreateScrimPayload, screenshotUrl : string) {

        //this.validateRules(payload);

        this.logger.log(
            `Creating scrim teamId=${teamId} createdBy=${userId} type=${payload.type} map=${payload.map} rounds=${payload.teamRounds}-${payload.enemyRounds}`,
            'ScrimsService'
        )

        const memberIds = payload.teamStats
            .map((p) => p.userId)
            .filter((id) : id is string => typeof id === 'string' && id.length > 0);

        const ok = await this.teamMemberService.areUsersMembersOfTeam(teamId, memberIds)

        if (!ok) throw new BadRequestException('Some teamStats userId do not belong to the team');

        return this.scrimModel.create({
            teamId : new Types.ObjectId(teamId),
            createdBy : new Types.ObjectId(userId),
            ...payload,
            screenshotUrl,
            teamStats: payload.teamStats.map((p) => ({
                ...p,
                userId: p.userId ? new Types.ObjectId(p.userId) : undefined
            })),
        })
    }

    async findByTeam( teamId : string ) {
        return this.scrimModel
            .find({ teamId: new Types.ObjectId(teamId)})
            .sort('-_id')
            .lean()
            .exec();
    }

    async findOne( teamId : string, scrimId: string ) {
        return this.scrimModel
            .findOne({ _id: new Types.ObjectId(scrimId), teamId : new Types.ObjectId(teamId) })
            .lean()
            .exec();
    }

}
