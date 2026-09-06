import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { MatchSide } from "src/common/enums/team-role.enum";
import { ValorantMap } from "src/common/enums/valorant-map.enum";

@Schema({ timestamps: true, versionKey: false })
export class Strat {
  @Prop({ type: Types.ObjectId, ref: "Team", required: true })
  teamId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: MatchSide })
  side: MatchSide;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true, enum: ValorantMap })
  map: ValorantMap;

  @Prop({ required: false, maxlength: 5000 })
  notes?: string;

  @Prop({ required: true })
  screenshotUrl: string;
}

export const StratSchema = SchemaFactory.createForClass(Strat);
