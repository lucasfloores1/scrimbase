import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamMemberGuard } from './guards/team-member.guard';
import { JoinTeamByCodeDto } from './dto/join-team-by-code.dto';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { TeamResponseDto } from './dto/team.response.dto';
import { TeamMemberResponseDto } from './dto/team-member.response.dto';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

    @Post()
    @Serialize(TeamResponseDto)
    async createTeam(@Req() req, @Body() dto: CreateTeamDto) {
        return this.teamsService.createTeam(req.user.userId, dto);
    }

    @Get('me')
    @UseGuards(TeamMemberGuard)
    @Serialize(TeamResponseDto)
    async getMyTeam(@Req() req) {
        return this.teamsService.getUserTeam(req.user.userId);
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
