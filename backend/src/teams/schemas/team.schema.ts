import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BillingStatus } from "../enums/billing-status.enum";
import { TeamPlan } from "../enums/team-plan.enum";

@Schema( { timestamps: true, versionKey : false } )
export class Team {
    _id: Types.ObjectId;

    @Prop( { required: true, unique: true } )
    name: string;

    @Prop( { required: true, uppercase: true } )
    tag: string;

    @Prop( { type: Types.ObjectId, ref: 'User' , required: true} )
    createdBy: Types.ObjectId;

    @Prop( { required : true, unique: true, index : true } )
    inviteCode: string;

    @Prop({ type: String, enum: TeamPlan, default: TeamPlan.FREE })
    plan: TeamPlan;

    @Prop({ type: Types.ObjectId, ref: "User", required: false })
    billingOwnerUserId?: Types.ObjectId;

    @Prop({ required: false, type: Date })
    planExpiresAt?: Date;

    @Prop({ type: String, enum: BillingStatus, default: BillingStatus.NONE })
    billingStatus: BillingStatus;

    /** Payment provider key, e.g. polar / lemonsqueezy. Filled when checkout is wired. */
    @Prop({ type: String, required: false })
    billingProvider?: string;

    @Prop({ type: String, required: false })
    billingProviderCustomerId?: string;

    @Prop({ type: String, required: false })
    billingProviderSubscriptionId?: string;
}

export const TeamSchema = SchemaFactory.createForClass( Team );

TeamSchema.index(
    { billingProviderSubscriptionId: 1 },
    { unique: true, sparse: true },
);
