import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamMemberGuard } from './guards/team-member.guard';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
    constructor(
        private readonly teamsService: TeamsService
    ) {}

    @Post()
    async createTeam(@Req() req, @Body() dto: CreateTeamDto) {
        return this.teamsService.createTeam(req.user.userId, dto);
    }

    @Get('me')
    @UseGuards(TeamMemberGuard)
    async getMyTeam(@Req() req) {
        return this.teamsService.getUserTeam(req.user.userId);
    }

}
