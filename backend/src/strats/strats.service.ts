import { Inject, Injectable, type LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Strat } from './schemas/strat.schema';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Model, Types } from 'mongoose';
import { CreateStratDto } from './dto/create-strat.dto';

@Injectable()
export class StratsService {
    constructor(
        @InjectModel(Strat.name) private readonly stratModel : Model<Strat>,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger : LoggerService,
    ) {}

    async create(teamId : string, userId: string, payload : CreateStratDto, screenshotUrl : string) {
        this.logger.log(`Creating strat teamId=${teamId} createdBy=${userId} map=${payload.map}`, 'StratsService',);

        return this.stratModel.create({
            teamId : new Types.ObjectId(teamId),
            createdBy : new Types.ObjectId(userId),
            map : payload.map,
            notes : payload.notes,
            screenshotUrl,
        });

    }

    async findByTeam (teamId : string) {
        return this.stratModel
            .find({  teamId : new Types.ObjectId(teamId) })
            .sort('-_id')
            .lean()
            .exec();
    }

    async findOne( teamId: string, stratId : string ) {
        return this.stratModel
            .findOne({ _id : new Types.ObjectId(stratId), teamId : new Types.ObjectId(teamId) })
            .lean()
            .exec();
    }

}
