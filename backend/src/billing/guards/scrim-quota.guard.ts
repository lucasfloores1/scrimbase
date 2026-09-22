import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { BillingService } from "../billing.service";

@Injectable()
export class ScrimQuotaGuard implements CanActivate {
    constructor(private readonly billingService: BillingService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const teamId = resolveTeamId(req);

        if (!teamId) throw new ForbiddenException("User is not a member of any team");

        await this.billingService.assertCanCreateScrim(teamId);

        return true;
    }
}

function resolveTeamId(req: any): string {
    const fromParams = req?.params?.teamId;
    if (fromParams) return fromParams;

    const raw = req?.user?.teamMember?.teamId;
    if (!raw) return "";
    if (typeof raw === "string") return raw;

    return raw?._id?.toString?.() ?? raw?.toString?.() ?? String(raw?._id ?? raw);
}
