import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Scrim, ScrimSchema } from "src/scrims/schemas/scrim.schema";
import { TeamsModule } from "src/teams/teams.module";

import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { ScrimQuotaGuard } from "./guards/scrim-quota.guard";
import { BillingCheckout, BillingCheckoutSchema } from "./schemas/billing-checkout.schema";
import { TeamSubscription, TeamSubscriptionSchema } from "./schemas/team-subscription.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeamSubscription.name, schema: TeamSubscriptionSchema },
      { name: BillingCheckout.name, schema: BillingCheckoutSchema },
      { name: Scrim.name, schema: ScrimSchema },
    ]),
    TeamsModule,
  ],
  providers: [BillingService, ScrimQuotaGuard],
  controllers: [BillingController],
  exports: [BillingService, ScrimQuotaGuard],
})
export class BillingModule {}
