import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamMemberGuard } from './guards/team-member.guard';
import { JoinTeamByCodeDto } from './dto/join-team-by-code.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { TeamResponseDto } from './dto/team.response.dto';
import { TeamMemberResponseDto } from './dto/team-member.response.dto';
import { TeamPlanService } from './team-plan.service';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
    constructor(
        private readonly teamsService: TeamsService,
        private readonly teamPlanService: TeamPlanService,
    ) {}

    @Post()
    @Serialize(TeamResponseDto)
    async createTeam(@Req() req, @Body() dto: CreateTeamDto) {
        const team = await this.teamsService.createTeam(req.user.userId, dto);
        return this.teamPlanService.enrichTeam(team);
    }

    @Get('me')
    @UseGuards(TeamMemberGuard)
    @Serialize(TeamResponseDto)
    async getMyTeam(@Req() req) {
        const team = await this.teamsService.getUserTeam(req.user.userId);
        if (!team) return team;
        return this.teamPlanService.enrichTeam(team);
    }

    @Post(':teamId/join')
    @Serialize(TeamMemberResponseDto)
    async joinTeam(@Req() req, @Param('teamId') teamId: string) {
        return this.teamsService.joinTeam(req.user.userId, teamId);
    }

    @Post('join')
    @Serialize(TeamMemberResponseDto)
    async joinByInviteCode(@Req() req, @Body() dto: JoinTeamByCodeDto) {
        return this.teamsService.joinByInviteCode(req.user.userId, dto.inviteCode);
    }
}
