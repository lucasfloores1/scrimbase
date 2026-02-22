import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export enum ScrimParseAttemptStatus {
  SUCCESS = "SUCCESS",
  FAILED_PROVIDER = "FAILED_PROVIDER",
  FAILED_JSON = "FAILED_JSON",
  FAILED_VALIDATION = "FAILED_VALIDATION",
}

@Schema({ timestamps: true })
export class ScrimParseAttempt {
  @Prop({ type: Types.ObjectId, ref: "Team", required: true })
  teamId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ScrimParseAttemptStatus })
  status: ScrimParseAttemptStatus;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  model: string;

  @Prop({ type: String, required: true })
  rawText: string;

  @Prop({ type: Object, required: false })
  errorMeta?: Record<string, any>;

  @Prop({ required: true })
  expiresAt: Date;
}

export const ScrimParseAttemptSchema = SchemaFactory.createForClass(ScrimParseAttempt);
ScrimParseAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });