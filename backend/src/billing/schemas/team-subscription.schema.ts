import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { TeamPlan } from "../enums/team-plan.enum";
import { BillingCycle } from "../enums/billing-cycle.enum";
import { SubscriptionStatus } from "../enums/subscription-status.enum";

@Schema({ timestamps: true, versionKey: false })
export class TeamSubscription {

    @Prop({ type: Types.ObjectId, ref: "Team", required: true, unique: true, index: true })
    teamId: Types.ObjectId;

    @Prop({ enum: TeamPlan, required: true, default: TeamPlan.FREE })
    plan: TeamPlan;

    @Prop({ enum: SubscriptionStatus, required: true, default: SubscriptionStatus.ACTIVE })
    status: SubscriptionStatus;

    @Prop({ enum: BillingCycle, required: false })
    cycle?: BillingCycle;

    @Prop()
    currentPeriodStart?: Date;

    @Prop()
    currentPeriodEnd?: Date;

    @Prop({ default: false })
    cancelAtPeriodEnd: boolean;

    @Prop()
    provider?: string;

    @Prop()
    externalId?: string;

    @Prop({ type: Types.ObjectId, ref: "User" })
    activatedBy?: Types.ObjectId;
}

export const TeamSubscriptionSchema = SchemaFactory.createForClass(TeamSubscription);
