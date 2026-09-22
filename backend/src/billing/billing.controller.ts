import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { TeamAdminGuard } from "src/teams/guards/team-admin.guard";
import { TeamMemberGuard } from "src/teams/guards/team-member.guard";

import { BillingService } from "./billing.service";
import { StartCheckoutDto } from "./dto/start-checkout.dto";

@Controller("teams/:teamId/billing")
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Get()
    async getStatus(@Param("teamId") teamId: string) {
        return this.billingService.getStatus(teamId);
    }

    @Get("plans")
    plans() {
        return this.billingService.listPrices();
    }

    @Post("checkout")
    @UseGuards(TeamAdminGuard)
    async startCheckout(@Param("teamId") teamId: string, @Req() req: any, @Body() dto: StartCheckoutDto) {
        return this.billingService.createCheckout(teamId, req.user.userId, dto.cycle);
    }

    @Get("checkout/:checkoutId")
    async getCheckout(@Param("teamId") teamId: string, @Param("checkoutId") checkoutId: string) {
        return this.billingService.getCheckout(teamId, checkoutId);
    }

    @Post("checkout/:checkoutId/confirm")
    @UseGuards(TeamAdminGuard)
    async confirmCheckout(
        @Param("teamId") teamId: string,
        @Param("checkoutId") checkoutId: string,
        @Req() req: any,
    ) {
        return this.billingService.confirmCheckout(teamId, req.user.userId, checkoutId);
    }

    @Post("cancel")
    @UseGuards(TeamAdminGuard)
    async cancel(@Param("teamId") teamId: string) {
        return this.billingService.cancel(teamId);
    }

    @Post("resume")
    @UseGuards(TeamAdminGuard)
    async resume(@Param("teamId") teamId: string) {
        return this.billingService.resume(teamId);
    }
}
