import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { TeamPlanService } from "../team-plan.service";

@Injectable()
export class TeamParseQuotaGuard implements CanActivate {
  constructor(private readonly teamPlanService: TeamPlanService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const teamId = req.params?.teamId;
    await this.teamPlanService.assertCanParse(teamId);
    return true;
  }
}
