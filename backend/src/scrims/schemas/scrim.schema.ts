import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ScrimType } from "../enums/scrim-type.enum";
import { ScrimOutcome } from "../enums/scrim-outcome.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";
import { ValorantAgent } from "src/common/enums/valorant-agent.enum";

@Schema({ _id: false })
export class ScrimPlayerStat {
  @Prop({ type: Types.ObjectId, ref: "User", required: false })
  userId?: Types.ObjectId;

  @Prop({ required: false })
  displayName?: string;

  @Prop({ required: true, enum: ValorantAgent })
  agent: ValorantAgent;

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

@Schema({ timestamps: true, versionKey: false })
export class Scrim {
  @Prop({ type: Types.ObjectId, ref: "Team", required: true })
  teamId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;

  @Prop({ enum: ScrimType, required: true })
  type: ScrimType;

  @Prop({ required: true, enum: ValorantMap })
  map: ValorantMap;

  /** Display name of the opposing team (user-entered). */
  @Prop({ required: true, trim: true })
  opponentName: string;

  @Prop({ required: true, min: 0, max: 24 })
  teamRounds: number;

  @Prop({ required: true, min: 0, max: 24 })
  enemyRounds: number;

  @Prop({ enum: ScrimOutcome, required: true })
  outcome: ScrimOutcome;

  @Prop({ required: true })
  screenshotUrl: string;

  @Prop({ type: [ScrimPlayerStatSchema], required: true })
  teamStats: ScrimPlayerStat[];

  @Prop({ type: [String], enum: ValorantAgent, required: true })
  enemyComposition: ValorantAgent[];
}

export const ScrimSchema = SchemaFactory.createForClass(Scrim);

ScrimSchema.index({ teamId: 1, createdAt: -1 });
ScrimSchema.index({ teamId: 1, map: 1, createdAt: -1 });
ScrimSchema.index({ teamId: 1, outcome: 1, createdAt: -1 });
ScrimSchema.index({ teamId: 1, type: 1, createdAt: -1 });
ScrimSchema.index({ teamId: 1, opponentName: 1 });
ScrimSchema.index({ teamId: 1, enemyComposition: 1 });
ScrimSchema.index({ teamId: 1, "teamStats.userId": 1, createdAt: -1 });
