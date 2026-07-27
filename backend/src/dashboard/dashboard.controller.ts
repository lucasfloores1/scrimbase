import { Controller, Get, Inject, type LoggerService, Req, UseGuards } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { TeamMemberGuard } from "src/teams/guards/team-member.guard";
import { DashboardService } from "./dashboard.service";
import { DashboardResponseDto } from "./dto/dashboard-response.dto";
import { Serialize } from "src/common/decorators/serialize.decorator";

@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  @Get()
  @Serialize(DashboardResponseDto)
  @UseGuards(JwtAuthGuard, TeamMemberGuard)
  async getMyTeamDashboard(@Req() req: any): Promise<DashboardResponseDto> {
    const membership = req.user.teamMember;
    const teamId =
      typeof membership?.teamId === "string"
        ? membership.teamId
        : membership?.teamId?._id?.toString?.() ?? membership?.teamId?.toString?.();

    return this.dashboardService.getTeamDashboard(teamId);
  }
}
