import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { TeamMemberGuard } from "src/teams/guards/team-member.guard";
import { Serialize } from "src/common/decorators/serialize.decorator";
import { PlayersService } from "./players.service";
import { PlayerStatsResponseDto } from "./dto/player-stats.response.dto";

@Controller("teams/:teamId/members")
@UseGuards(JwtAuthGuard, TeamMemberGuard)
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get(":userId/stats")
  @Serialize(PlayerStatsResponseDto)
  getPlayerStats(
    @Param("teamId") teamId: string,
    @Param("userId") userId: string,
  ): Promise<PlayerStatsResponseDto> {
    return this.playersService.getPlayerStats(teamId, userId);
  }
}
