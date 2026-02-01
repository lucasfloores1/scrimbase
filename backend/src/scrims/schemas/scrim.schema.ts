import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ScrimType } from "../enums/scrim-type.enum";
import { ScrimOutcome } from "../enums/scrim-outcome.enum";

@Schema({ _id: false })
export class ScrimPlayerStat {

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    userId?: Types.ObjectId;

    @Prop({ required: false })
    displayName?: string;

    @Prop({ required: true })
    agent: string;

    @Prop({ required: true, min: 0 })
    kills: number;

    @Prop({ required: true, min: 0 })
    deaths: number;

    @Prop({ required: true, min: 0 })
    assists: number;

    @Prop({ required: true, min: 0 })
    acs: number;
}

export const ScrimPlayerStatSchema = SchemaFactory.createForClass(ScrimPlayerStat);

@Schema({ timestamps: true })
export class Scrim {

    @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
    teamId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ enum: ScrimType, required: true })
    type: ScrimType;

    @Prop({ required: true })
    map: string;

    @Prop({ required: true, min: 0, max: 24 })
    teamRounds: number;

    @Prop({ required: true, min: 0, max: 24 })
    enemyRounds: number;

    @Prop({ enum: ScrimOutcome, required : true })
    outcome : ScrimOutcome;

    @Prop({ required : true })
    screenshotUrl : string;

    @Prop({ type : [ScrimPlayerStatSchema], required : true })
    teamStats : ScrimPlayerStat[];

    @Prop({ type : [String], required : true })
    enemyComposition : string[];

}

export const ScrimSchema = SchemaFactory.createForClass(Scrim);
