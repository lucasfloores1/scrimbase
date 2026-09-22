import { IsEnum } from "class-validator";
import { BillingCycle } from "../enums/billing-cycle.enum";

export class StartCheckoutDto {
    @IsEnum(BillingCycle)
    cycle: BillingCycle;
}
