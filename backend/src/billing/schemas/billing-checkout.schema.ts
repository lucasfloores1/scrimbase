import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BillingCycle } from "../enums/billing-cycle.enum";
import { CheckoutStatus } from "../enums/checkout-status.enum";

@Schema({ timestamps: true, versionKey: false })
export class BillingCheckout {

    @Prop({ type: Types.ObjectId, ref: "Team", required: true, index: true })
    teamId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    userId: Types.ObjectId;

    @Prop({ enum: BillingCycle, required: true })
    cycle: BillingCycle;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    currency: string;

    @Prop({ required: true })
    provider: string;

    @Prop({ enum: CheckoutStatus, required: true, default: CheckoutStatus.PENDING })
    status: CheckoutStatus;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop()
    paidAt?: Date;
}

export const BillingCheckoutSchema = SchemaFactory.createForClass(BillingCheckout);
